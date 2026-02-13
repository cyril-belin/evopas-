"use client";

import { useEffect, useState } from "react";
import type { WebsocketProvider } from "y-websocket";
import { motion, AnimatePresence } from "framer-motion";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

interface PresenceUser {
  name: string;
  color: string;
  clientId: number;
}

interface PresenceIndicatorProps {
  provider: WebsocketProvider | null;
}

export function PresenceIndicator({ provider }: PresenceIndicatorProps) {
  const [users, setUsers] = useState<PresenceUser[]>([]);

  useEffect(() => {
    if (!provider) return;

    const awareness = provider.awareness;

    function updateUsers() {
      const states = awareness.getStates();
      const newUsers: PresenceUser[] = [];
      states.forEach((state, clientId) => {
        if (clientId !== awareness.clientID && state.user) {
          newUsers.push({
            name: state.user.name,
            color: state.user.color,
            clientId,
          });
        }
      });
      setUsers(newUsers);
    }

    awareness.on("change", updateUsers);
    updateUsers();

    return () => {
      awareness.off("change", updateUsers);
    };
  }, [provider]);

  if (users.length === 0) return null;

  return (
    <TooltipProvider>
      <div className="flex items-center gap-1">
        <AnimatePresence>
          {users.map((user) => (
            <motion.div
              key={user.clientId}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
            >
              <Tooltip>
                <TooltipTrigger>
                  <div
                    className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium text-white"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                </TooltipTrigger>
                <TooltipContent>{user.name} is editing</TooltipContent>
              </Tooltip>
            </motion.div>
          ))}
        </AnimatePresence>
        <span className="text-xs text-neutral-500">
          {users.length} {users.length === 1 ? "person" : "people"} editing
        </span>
      </div>
    </TooltipProvider>
  );
}
