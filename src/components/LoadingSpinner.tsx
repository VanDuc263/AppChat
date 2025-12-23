import "../styles/LoadingSpinner.css";

interface LoadingSpinnerProps {
    text?: string;
    fullScreen?: boolean;
}

export default function LoadingSpinner({
                                           text = "Đang tải...",
                                           fullScreen = false,
                                       }: LoadingSpinnerProps) {
    return (
        <div className={`loader ${fullScreen ? "overlay" : ""}`}>
            <div className="loader-container">
                <div className="ball">
                    <div className="inner">
                        <div className="line"></div>
                        <div className="line line--two"></div>
                        <div className="oval"></div>
                        <div className="oval oval--two"></div>
                    </div>
                </div>
                <div className="shadow"></div>
                {text && <p className="loading-text">{text}</p>}
            </div>
        </div>
    );
}
