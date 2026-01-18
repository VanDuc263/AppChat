import { useEffect, useState } from "react";
import { subscribeSocketStatus } from "../services/socket";

export function useSocketStatus() {
    const [status, setStatus] = useState<
        "idle" | "connecting" | "connected" | "reconnecting" | "disconnected"
    >("idle");

    useEffect(() => {
        return subscribeSocketStatus(setStatus);
    }, []);

    return status;
}
