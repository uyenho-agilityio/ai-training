import { EventEncoder } from "@ag-ui/encoder";
import { decode, encode } from "@ag-ui/proto";
import type { BaseEvent } from "@ag-ui/core";

const encoder = new EventEncoder({
  accept: "application/vnd.ag-ui.event+proto, text/event-stream",
});

/** Demo: round-trip event qua @ag-ui/proto + log SSE từ @ag-ui/encoder */
export const logAgUiTransport = (label: string, event: BaseEvent) => {
  const binary = encode(event);
  const roundTrip = decode(binary);
  const sse = encoder.encode(event);

  console.log(`[${label}] transport`, {
    type: event.type,
    protoBytes: binary.byteLength,
    roundTripType: roundTrip.type,
    ssePreview: sse.slice(0, 120),
  });
};
