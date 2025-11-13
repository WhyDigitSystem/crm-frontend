export default function useSpeech() {
    const speak = (text) => {
        if (!text) return;
        const utter = new SpeechSynthesisUtterance(text);
        utter.lang = "en-IN";
        utter.rate = 1;
        utter.pitch = 1;
        window.speechSynthesis.speak(utter);
    };
    return { speak };
}
