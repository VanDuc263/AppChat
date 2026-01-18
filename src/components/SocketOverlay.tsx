import LoadingSpinner from "../components/LoadingSpinner";
import { useSocketStatus } from "../hooks/useSocketStatus";

const SocketOverlay: React.FC = () => {
    const status = useSocketStatus();

    if (status === "connected" || status === "idle") return null;

    let text = "Đang kết nối...";
    if (status === "reconnecting") text = "Mất kết nối, đang thử lại...";
    if (status === "disconnected") text = "Đang kết nối lại...";

    return <LoadingSpinner text={text} fullScreen />;
};

export default SocketOverlay;
