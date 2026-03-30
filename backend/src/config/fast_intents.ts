export type FastIntent = {
  keys: string[];
  reply: string;
};

export const FAST_INTENTS: FastIntent[] = [
  { keys: ["warm light", "warm lights"], reply: "Got it. Warm lights on now." },
  { keys: ["cool light", "cold light"], reply: "Switching to cool lights now." },
  { keys: ["ambient light", "ambient mode"], reply: "Ambient lighting enabled." },
  { keys: ["dim lights", "lower lights", "lower the lights"], reply: "Dimming the lights for you." },
  { keys: ["brighten lights", "brighter lights"], reply: "Brightening the lights now." },
  { keys: ["raise temperature", "warmer", "increase temp"], reply: "Raising temperature to comfort mode." },
  { keys: ["lower temperature", "cooler", "decrease temp"], reply: "Lowering temperature now." },
  { keys: ["turn off lights", "lights off"], reply: "Lights off now." },
  { keys: ["turn on lights", "lights on"], reply: "Lights on to standard level." },
  { keys: ["relax mode", "rest mode"], reply: "Relax mode on: soft lights and steady climate." },
  { keys: ["open curtains", "raise blinds"], reply: "Opening curtains now." },
  { keys: ["close curtains", "lower blinds"], reply: "Closing curtains now." },
  { keys: ["towels"], reply: "Towels requested. Staff notified." },
  { keys: ["pillows", "extra pillow"], reply: "Extra pillows are on the way." },
  { keys: ["water", "bottle of water"], reply: "Sending water to your room." },
  { keys: ["cleaning", "housekeeping"], reply: "Housekeeping requested." },
  { keys: ["room service"], reply: "Room service notified immediately." },
  { keys: ["wake up", "alarm"], reply: "Wake-up call scheduled." },
  { keys: ["taxi", "uber", "ride"], reply: "Arranging a ride for you now." },
  { keys: ["spa", "massage"], reply: "Scheduling a spa option for you." },
  { keys: ["checkout", "check out"], reply: "Starting secure checkout now." },
  { keys: ["late checkout", "late check out"], reply: "Late checkout requested." },
  { keys: ["do not disturb", "dnd"], reply: "Do Not Disturb is now on." },
];
