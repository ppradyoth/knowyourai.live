---
title: "Validate every tool call on the server"
description: "Model output is untrusted input. Check every tool-call argument against a schema and recompute prices, IDs and recipients from your own data."
stage: before-first-users
builds: [tool-calling-agent, chatbot, mcp-server]
time: "30 min"
case: priceline-penny
tools: [railproof]
owasp: ["LLM06:2025"]
checklist: "Every tool validates its arguments on the server and recomputes prices and IDs from your own data."
agent_rule: "Treat every tool-call argument from the model as untrusted input: validate it against a schema on the server and never take prices, IDs, recipients or permissions from model output."
review: pending
updated: 2026-10-11
---

## The risk

A tool call is text the model wrote. If hostile text reached the model, the arguments are whatever that text asked for. A tool that trusts its arguments lets a stranger choose the price, the recipient or the record ID.

## What happened in production

The agent passed attacker-chosen values into a real tool. The tool had no way to know they were wrong, because it never checked them against anything.

## The fix

1. Define a schema for every tool and reject calls that do not match it.
2. Take from the model only what the user is allowed to choose: which item, which dates, how many.
3. Look up everything else yourself: prices, discounts, account IDs, email addresses, permissions.
4. Deny by default. A tool the request does not need is a tool the model cannot call.

```ts
import { z } from "zod";

const BookHotel = z.object({
  hotelId: z.string().regex(/^h_[a-z0-9]{8}$/),
  nights: z.number().int().min(1).max(30),
});

export async function bookHotel(rawArgs: unknown, userId: string) {
  const args = BookHotel.safeParse(rawArgs);
  if (!args.success) return { error: "invalid_arguments" };

  const hotel = await db.hotels.findById(args.data.hotelId);
  if (!hotel) return { error: "unknown_hotel" };

  const total = hotel.nightlyRate * args.data.nights;
  return createBooking({ userId, hotelId: hotel.id, nights: args.data.nights, total });
}
```

```python
from pydantic import BaseModel, Field, ValidationError

class BookHotel(BaseModel):
    hotel_id: str = Field(pattern=r"^h_[a-z0-9]{8}$")
    nights: int = Field(ge=1, le=30)

def book_hotel(raw_args: dict, user_id: str) -> dict:
    try:
        args = BookHotel.model_validate(raw_args)
    except ValidationError:
        return {"error": "invalid_arguments"}

    hotel = db.hotels.find_by_id(args.hotel_id)
    if hotel is None:
        return {"error": "unknown_hotel"}

    total = hotel.nightly_rate * args.nights
    return create_booking(user_id=user_id, hotel_id=hotel.id, nights=args.nights, total=total)
```

`db` and `createBooking` stand for your own code. The price never appears in the schema, so the model cannot set it.

## Prove it works

Call the tool function directly, without the model, with arguments an attacker would want:

- an extra `price: 1` field
- a `hotelId` that belongs to nothing
- `nights: -1`

Each call must return an error or ignore the extra field. Put these three calls in your test suite so a refactor cannot remove the check.

## Know the limit

Schema validation stops malformed and out-of-range arguments. It does not stop a call that is valid but unwanted, such as booking a real hotel the user never asked for. For that you need an approval step on actions that cost money or cannot be undone.
