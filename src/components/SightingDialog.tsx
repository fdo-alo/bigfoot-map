
import { useEffect, useRef, useState } from "react";
import type { BigfootReport } from "../types/BigfootReport";
import "./SightingDialog.css";
import FootzyAnimation from "./FootzyAnimation.tsx";

interface SightingDialogProps {
    reports: BigfootReport[];
    onClose: () => void;
}

export default function SightingDialog({
                                           reports,
                                           onClose
                                       }: SightingDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [index, setIndex] = useState(0);
    const [audioState, setAudioState] = useState<
        "stopped" | "playing" | "paused"
    >("stopped");

    const report = reports[index];

    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const bodyRef = useRef<HTMLElement>(null);

    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const [voiceGender, setVoiceGender] = useState<"male" | "female">("male");

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;

        if (!dialog.open) dialog.showModal();

        return () => {
            utteranceRef.current = null;
            window.speechSynthesis.cancel();
            if (dialog.open) dialog.close();
        };
    }, []);

    useEffect(() => {
        const synth = window.speechSynthesis;

        const loadVoices = () => {
            setVoices(synth.getVoices());
        };

        loadVoices();

        synth.addEventListener("voiceschanged", loadVoices);

        return () => {
            synth.removeEventListener("voiceschanged", loadVoices);
        };
    }, []);

    // Stop audio whenever the selected case changes.
    useEffect(() => {
        utteranceRef.current = null;
        window.speechSynthesis.cancel();
        setAudioState("stopped");
    }, [index, reports]);

    function selectVoice(): SpeechSynthesisVoice | undefined {
        const englishVoices = voices.filter(v =>
            v.lang.toLowerCase().startsWith("en")
        );

        const patterns = voiceGender === "female"
            ? /female|zira|samantha|victoria|aria|jenny|ava|susan/i
            : /male|david|mark|guy|daniel|alex|fred/i;

        return englishVoices.find(v => patterns.test(v.name))
            ?? englishVoices[0];
    }


    function stopAudio() {
        // Invalidate callbacks belonging to previous playback.
        utteranceRef.current = null;

        window.speechSynthesis.cancel();
        setAudioState("stopped");
    }

    function playAudio() {
        if (!report?.observed) return;

        const synth = window.speechSynthesis;

        // Resume only if we actually have a paused utterance.
        if (
            audioState === "paused" &&
            utteranceRef.current &&
            synth.paused
        ) {
            synth.resume();
            setAudioState("playing");
            return;
        }

        // Start a new narration.
        utteranceRef.current = null;
        synth.cancel();

        const speech = new SpeechSynthesisUtterance(report.observed);
        speech.lang = "en-US";
        speech.rate = 0.9;

        const selectedVoice = selectVoice();

        if (selectedVoice) {
            speech.voice = selectedVoice;
            speech.lang = selectedVoice.lang;
        }

        utteranceRef.current = speech;

        speech.onend = () => {
            if (utteranceRef.current !== speech) return;

            utteranceRef.current = null;
            setAudioState("stopped");
        };

        speech.onerror = (event) => {
            if (utteranceRef.current !== speech) return;

            console.error("Speech synthesis error:", event.error);
            utteranceRef.current = null;
            setAudioState("stopped");
        };

        synth.speak(speech);
        setAudioState("playing");
    }

    function pauseAudio() {
        if (!utteranceRef.current) return;

        window.speechSynthesis.pause();
        setAudioState("paused");
    }

    function navigate(direction: number) {
        stopAudio();

        setIndex(current =>
            (current + direction + reports.length) % reports.length
        );

        bodyRef.current?.scrollTo({
            top: 0,
            behavior: "instant"
        });
    }

    function formatDate(value: string | null) {
        if (!value) return "Unknown";

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return value;

        return date.toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            timeZone: "UTC"
        });
    }

    if (!report) return null;

    return (
        <dialog
            ref={dialogRef}
            className="sighting-dialog"
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
        >
            <div className="case-file">

                <header className="case-header">
                    <div className="case-header-content">
                        <FootzyAnimation />

                        <div className="case-header-text">
            <span className="case-eyebrow">
                BFRO ARCHIVES / CASE #{report.number}
            </span>

                            <h2>{report.title || "Untitled sighting"}</h2>

                            <p className="case-location">
                                📍 {report.county}, {report.state}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="close-button"
                        aria-label="Close case file"
                        onClick={onClose}
                    >
                        ×
                    </button>
                </header>

                <main className="case-body" ref={bodyRef}>
                    <div className="case-metadata">
                        <div className="metadata-item">
                            <span>Reported date</span>
                            <strong>{formatDate(report.date)}</strong>
                        </div>

                        <div className="metadata-item">
                            <span>Season</span>
                            <strong>{report.season || "Unknown"}</strong>
                        </div>

                        <div className="metadata-item">
                            <span>County</span>
                            <strong>{report.county}</strong>
                        </div>

                        <div className="metadata-item">
                            <span>Classification</span>
                            <strong>{report.classification}</strong>
                        </div>
                    </div>

                    <section className="case-testimony">
                        <div className="section-heading">
                            <h3>Witness testimony</h3>
                            <span>ORIGINAL REPORT</span>
                        </div>

                        <div className="testimony-text">
                            {report.observed || "No testimony available."}
                        </div>
                    </section>

                    <section className="case-audio">
                        <div className="audio-heading">
                            <strong>🔊 Listen to testimony</strong>
                            <span>English · TTS</span>
                        </div>

                        <div className="voice-selector">
                            <span className="voice-label">Narrator</span>

                            <div
                                className="voice-options"
                                role="group"
                                aria-label="Narrator voice"
                            >
                                <button
                                    type="button"
                                    className={voiceGender === "male" ? "active" : ""}
                                    aria-pressed={voiceGender === "male"}
                                    disabled={audioState !== "stopped"}
                                    onClick={() => setVoiceGender("male")}
                                >
                                    Male
                                </button>

                                <button
                                    type="button"
                                    className={voiceGender === "female" ? "active" : ""}
                                    aria-pressed={voiceGender === "female"}
                                    disabled={audioState !== "stopped"}
                                    onClick={() => setVoiceGender("female")}
                                >
                                    Female
                                </button>
                            </div>
                        </div>

                        <div className="audio-buttons">
                            <button
                                type="button"
                                className="primary-button"
                                onClick={playAudio}
                                disabled={!report.observed ||
                                    audioState === "playing"}
                            >
                                ▶ {audioState === "paused" ? "Resume" : "Play"}
                            </button>

                            <button
                                type="button"
                                onClick={pauseAudio}
                                disabled={audioState !== "playing"}
                            >
                                ⏸ Pause
                            </button>

                            <button
                                type="button"
                                onClick={stopAudio}
                                disabled={audioState === "stopped"}
                            >
                                ■ Stop
                            </button>
                        </div>
                    </section>
                </main>

                <footer className="case-navigation">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        disabled={reports.length <= 1}
                    >
                        ← Previous
                    </button>

                    <div className="case-position">
                        <strong>{index + 1} / {reports.length}</strong>
                        <span>Sightings in cluster</span>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(1)}
                        disabled={reports.length <= 1}
                    >
                        Next →
                    </button>
                </footer>

            </div>
        </dialog>
    );
}
