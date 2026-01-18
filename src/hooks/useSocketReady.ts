import { useEffect, useState } from "react";
import { subscribeSocketStatus } from "../services/socket";

export function useSocketReady() {
    const [ready, setReady] = useState(false);

    useEffect(() => {
        return subscribeSocketStatus((status) => {
            setReady(status === "connected");
        });
    }, []);

    return ready;
}
