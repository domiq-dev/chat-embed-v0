#!/usr/bin/env python3
"""
run_bot.py — Ava Leasing Assistant Agent (Updated)

Now, instead of sending an application link, this agent will:
  1. Collect prospect info
  2. INSERT it into your PostgreSQL 'prospects' table
  3. Send a confirmation message
A separate monitoring agent or process can then poll the DB for new entries.

Requirements:
    pip install langchain-community langgraph sqlalchemy psycopg2-binary python-dotenv

Environment variables (or set in your shell / container):
    OPENAI_API_KEY — your OpenAI API key
    DSN            — your Postgres DSN, e.g.
                     postgresql+psycopg2://DB_USER@HOST:5432/leases?sslmode=require
"""
# --------------------------------------------------------------------------------
# NEXT STEPS:
# Once the core leasing flows are in place, we’ll need to extend this agent to support:
# 1) Multi‐property tenancy by routing queries to the correct Pinecone namespace,
#    ingesting each property’s docs into a vector index and filtering by namespace;
# 2) Retrieval‐Augmented Generation for open‐ended questions against the property KB,
#    with RAG chains that pull from Pinecone and fall back to human escalation when confidence is low;
# 3) Tools for user profile lookup and pre‐approval status—fetching from PostgreSQL via secure APIs,
#    enforcing row‐level security and IAM authentication;
# 4) Persistent session memory (across browser sessions) so returning users can resume
#    incomplete tours or applications seamlessly;
# 5) A human‐in‐the‐loop handoff channel and admin dashboard for real-time escalations,
#    transcript review, and iterative KB improvement; and
# 6) Observability, metrics, caching, and performance optimizations (token-streaming, tool
#    parallelism, semantic caching) to ensure sub-second responses at scale.
# See "Design of a Multi-Property Conversational Agent System with LangChain, LangGraph,
# and Pinecone" for architecture details and component patterns :contentReference[oaicite:0]{index=0}.
# --------------------------------------------------------------------------------

import os
import re
from typing import TypedDict, List, Dict

from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from langchain.schema import BaseMessage, HumanMessage, AIMessage
from langchain_community.chat_models import ChatOpenAI
from langgraph.graph import StateGraph, END

# ── 1) Shared state ─────────────────────────────────────────────────────────

class LeasingState(TypedDict):
    messages: List[BaseMessage]   # chat history
    prospect: Dict                # fields: name, beds_wanted, move_in, …
    last_user_action: str         # "ASK_FAQ", "SCHEDULE_TOUR", …
    db_session: sessionmaker      # SQLAlchemy session

# ── 2) Database setup + injector ────────────────────────────────────────────

DSN = os.getenv(
    "DSN",
    "postgresql+psycopg2://DB_USER@YOUR_RDS_HOST:5432/leases?sslmode=require"
)
engine = create_engine(DSN, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine)

def db_inject(state: LeasingState) -> LeasingState:
    """Open a fresh DB session and ensure prospect dict exists."""
    state["db_session"] = SessionLocal()
    state.setdefault("prospect", {})
    return state

# ── 3) Static‐reply helper ─────────────────────────────────────────────────

def static_reply(text: str):
    def _fn(state: LeasingState) -> LeasingState:
        state["messages"].append(AIMessage(content=text))
        return state
    return _fn

# ── 4) Hard-coded prompts ──────────────────────────────────────────────────

GREETING            = "👋 Hi, I’m Ava, the leasing assistant. Let’s get you set up!"
Q_NAME              = "Great! What’s your first name?"
Q_MOVE              = "When would you like to move in? (Please enter a date.)"
MENU_MSG            = (
    "How can I help you today?\n"
    "1. Ask some questions\n"
    "2. Schedule a tour\n"
    "3. Get pre-qualified\n"
    "4. Apply now"
)
UPSELL_PREQUAL      = "💡 Save $25 on your application fee by getting pre-qualified now. Interested?"
UPSELL_POST_TOUR    = "🎉 Tour booked! Want to save $50 on move-in by getting pre-qualified?"
PREQUAL_PROMPT      = (
    "Using the prospect info below, write a one-sentence friendly congratulations "
    "confirming pre-qualification:\n\n{prospect}"
)
TOUR_CONFIRM_PROMPT = (
    "Craft a short, upbeat confirmation that repeats the tour date/time "
    "and tells the renter we'll send a calendar invite."
)

# ── 5) Mini-KB for FAQs ─────────────────────────────────────────────────────

COMMON_FAQS = [
    ("What is the monthly rent?",
     "Rent starts at $2,000 for a 1-bed, $2,500 for a 2-bed, and $3,000 for a 3-bed."),
    ("Are pets allowed?",
     "Yes! Up to two pets per apartment. There's a $250 non-refundable fee per pet."),
    ("Which utilities are included?",
     "Water and trash service are included; all other utilities are billed separately.")
]

# ── 6) Node implementations ─────────────────────────────────────────────────

def ask_beds(state: LeasingState) -> LeasingState:
    name = state["prospect"]["name"]
    text = f"Awesome {name}! Are you looking for a 1-, 2-, or 3-bedroom?"
    state["messages"].append(AIMessage(content=text))
    return state

def store_name(state: LeasingState) -> LeasingState:
    state["prospect"]["name"] = state["messages"][-1].content.strip()
    return state

def store_beds(state: LeasingState) -> LeasingState:
    reply = state["messages"][-1].content.strip()
    m = re.search(r"\b([1-3])\b", reply)
    if not m:
        state["messages"].append(
            AIMessage(content="Sorry, I didn't catch that. Please type 1, 2, or 3.")
        )
        return state
    state["prospect"]["beds_wanted"] = int(m.group(1))
    return state

def store_move_date(state: LeasingState) -> LeasingState:
    state["prospect"]["move_in"] = state["messages"][-1].content.strip()
    return state

def store_action(state: LeasingState) -> LeasingState:
    resp = state["messages"][-1].content.lower()
    if resp.startswith("1"):
        state["last_user_action"] = "ASK_FAQ"
    elif resp.startswith("2"):
        state["last_user_action"] = "SCHEDULE_TOUR"
    elif resp.startswith("3"):
        state["last_user_action"] = "GET_PREQUAL"
    else:
        state["last_user_action"] = "APPLY"
    return state

def faq_flow(state: LeasingState) -> LeasingState:
    msgs = state["messages"]
    last = msgs[-1].content.strip()
    if state.get("last_user_action") != "ASK_FAQ":
        menu = "\n".join(f"{i+1}. {q}" for i,(q,_) in enumerate(COMMON_FAQS))
        prompt = (
            "Here are some common questions—you can pick 1, 2, or 3, or ask something else:\n\n"
            f"{menu}\n\nOr type your own question."
        )
        msgs.append(AIMessage(content=prompt))
        state["last_user_action"] = "ASK_FAQ"
        return state
    if last.isdigit():
        idx = int(last) - 1
        if 0 <= idx < len(COMMON_FAQS):
            msgs.append(AIMessage(content=COMMON_FAQS[idx][1]))
            return state
    kb_block = "\n\n".join(f"Q: {q}\nA: {a}" for q,a in COMMON_FAQS)
    prompt = (
        "You are a leasing assistant with this knowledge base:\n\n"
        f"{kb_block}\n\n"
        f"User asks: “{last}”\n\n"
        "Answer concisely based only on the above."
    )
    llm = ChatOpenAI(model="gpt-4o-mini")
    resp = llm([HumanMessage(content=prompt)])
    answer = getattr(resp, "content", resp.generations[0][0].message.content)
    msgs.append(AIMessage(content=answer))
    return state

llm = ChatOpenAI(model="gpt-4o-mini")

def prequal_success(state: LeasingState) -> LeasingState:
    prompt = PREQUAL_PROMPT.format(prospect=state["prospect"])
    resp = llm([HumanMessage(content=prompt)])
    state["messages"].append(AIMessage(content=resp.content))
    return state

def tour_confirm(state: LeasingState) -> LeasingState:
    resp = llm([HumanMessage(content=TOUR_CONFIRM_PROMPT)])
    state["messages"].append(AIMessage(content=resp.content))
    return state

def submit_application(state: LeasingState) -> LeasingState:
    """Insert the collected prospect info into PostgreSQL."""
    session = state["db_session"]
    prospect = state["prospect"]
    session.execute(
        text("""
            INSERT INTO prospects (name, beds_wanted, move_in)
            VALUES (:name, :beds_wanted, :move_in)
        """),
        {
            "name": prospect["name"],
            "beds_wanted": prospect["beds_wanted"],
            "move_in": prospect["move_in"]
        }
    )
    session.commit()
    state["messages"].append(
        AIMessage(content=(
            "✅ Thanks for applying! Your info is saved and our leasing team "
            "will reach out to you shortly."
        ))
    )
    return state

# ── 7) Build & compile the StateGraph ──────────────────────────────────────

graph = StateGraph(LeasingState)

# Core flow
graph.add_node("db_inject",    db_inject)
graph.add_node("greet_user",   static_reply(GREETING))
graph.add_node("ask_name",     static_reply(Q_NAME))
graph.add_node("store_name",   store_name)
graph.add_node("ask_beds",     ask_beds)
graph.add_node("store_beds",   store_beds)
graph.add_node("ask_move",     static_reply(Q_MOVE))
graph.add_node("store_move",   store_move_date)
graph.add_node("show_menu",    static_reply(MENU_MSG))
graph.add_node("store_action", store_action)

# Branch nodes
graph.add_node("faq_flow",         faq_flow)
graph.add_node("upsell_prequal",   static_reply(UPSELL_PREQUAL))
graph.add_node("prequal_success",  prequal_success)
graph.add_node("upsell_post_tour", static_reply(UPSELL_POST_TOUR))
graph.add_node("tour_confirm",     tour_confirm)
graph.add_node("submit_application", submit_application)

# Transitions
graph.add_edge("db_inject",  "greet_user")
graph.add_edge("greet_user", "ask_name")
graph.add_edge("ask_name",   "store_name")
graph.add_edge("store_name", "ask_beds")
graph.add_edge("ask_beds",   "store_beds")
graph.add_edge("store_beds", "ask_move")
graph.add_edge("ask_move",   "store_move")
graph.add_edge("store_move", "show_menu")
graph.add_edge("show_menu",  "store_action")

graph.add_conditional_edges(
    "store_action",
    lambda s: s["last_user_action"],
    {
        "ASK_FAQ":       "faq_flow",
        "SCHEDULE_TOUR": "tour_confirm",
        "GET_PREQUAL":   "prequal_success",
        "APPLY":         "submit_application"
    }
)

graph.add_edge("faq_flow",       "upsell_prequal")
graph.add_edge("upsell_prequal", "show_menu")
graph.add_edge("prequal_success","upsell_post_tour")
graph.add_edge("upsell_post_tour","tour_confirm")

graph.set_entry_point("db_inject")
graph.set_finish_point("submit_application")

bot = graph.compile()

# ── 8) CLI runner ──────────────────────────────────────────────────────────

if __name__ == "__main__":
    from langchain.schema import HumanMessage

    state: LeasingState = {
        "messages": [],
        "prospect": {},
        "last_user_action": "",
        "db_session": None
    }
    # Kick off
    state = bot.invoke(state)
    print("Ava:", state["messages"][-1].content, "\n")

    while True:
        try:
            user = input("You: ")
        except (KeyboardInterrupt, EOFError):
            print("\nGoodbye!")
            break

        state["messages"].append(HumanMessage(content=user))
        state = bot.invoke(state)
        print("Ava:", state["messages"][-1].content, "\n")
