import {
    useCallback,
    useEffect,
    useState,
} from "react";

import {
    Button,
} from "@/components/ui/button";

import type {
    InterviewAudioConfig,
} from "../hooks/audio.types";


interface AudioSetupProps {

    onComplete: (
        config: InterviewAudioConfig
    ) => void;

    onCancel?: () => void;
}


interface AudioDevice {

    deviceId: string;

    label: string;

    groupId: string;
}


export default function AudioSetup({
    onComplete,
    onCancel,
}: AudioSetupProps) {

    const [
        microphones,
        setMicrophones,
    ] = useState<AudioDevice[]>([]);


    const [
        speakers,
        setSpeakers,
    ] = useState<AudioDevice[]>([]);


    const [
        selectedMicrophone,
        setSelectedMicrophone,
    ] = useState("");


    const [
        selectedSpeaker,
        setSelectedSpeaker,
    ] = useState<string | null>(
        null
    );


    const [
        microphoneReady,
        setMicrophoneReady,
    ] = useState(false);


    const [
        speakerReady,
        setSpeakerReady,
    ] = useState(false);


    const [
        isLoading,
        setIsLoading,
    ] = useState(false);


    const [
        error,
        setError,
    ] = useState<string | null>(
        null
    );


    /*
     * ============================================================
     * Enumerate devices
     * ============================================================
     */

    const refreshDevices =
        useCallback(
            async () => {

                if (
                    !navigator.mediaDevices
                ) {

                    throw new Error(
                        "Your browser does not support media devices."
                    );
                }


                const devices =
                    await navigator.mediaDevices
                        .enumerateDevices();


                const inputs =
                    devices
                        .filter(
                            device =>
                                device.kind ===
                                "audioinput"
                        )
                        .filter(
                            device =>
                                !isVirtualDevice(
                                    device.label
                                )
                        )
                        .map(
                            device => ({
                                deviceId:
                                    device.deviceId,

                                label:
                                    device.label ||
                                    "Microphone",

                                groupId:
                                    device.groupId,
                            })
                        );


                const outputs =
                    devices
                        .filter(
                            device =>
                                device.kind ===
                                "audiooutput"
                        )
                        .map(
                            device => ({
                                deviceId:
                                    device.deviceId,

                                label:
                                    device.label ||
                                    "Speaker",

                                groupId:
                                    device.groupId,
                            })
                        );


                setMicrophones(
                    inputs
                );


                setSpeakers(
                    outputs
                );


                /*
                 * Prefer the browser default input if available.
                 */

                if (
                    !selectedMicrophone
                ) {

                    const defaultInput =
                        inputs.find(
                            device =>
                                device.deviceId ===
                                "default"
                        );


                    const firstInput =
                        defaultInput ??
                        inputs[0];


                    if (
                        firstInput
                    ) {

                        setSelectedMicrophone(
                            firstInput.deviceId
                        );
                    }
                }


                /*
                 * Default output.
                 */

                if (
                    selectedSpeaker === null &&
                    outputs.length > 0
                ) {

                    const defaultOutput =
                        outputs.find(
                            device =>
                                device.deviceId ===
                                "default"
                        );


                    setSelectedSpeaker(
                        defaultOutput?.deviceId ??
                        outputs[0].deviceId
                    );
                }

            },
            [
                selectedMicrophone,
                selectedSpeaker,
            ]
        );


    /*
     * ============================================================
     * Ask for microphone permission first
     *
     * This allows the browser to reveal device labels.
     * ============================================================
     */

    const prepareDevices =
        useCallback(
            async () => {

                setIsLoading(
                    true
                );


                setError(
                    null
                );


                try {

                    const stream =
                        await navigator.mediaDevices
                            .getUserMedia({
                                audio:
                                    true,

                                video:
                                    false,
                            });


                    /*
                     * We only needed this stream to obtain permission.
                     */

                    for (
                        const track of
                        stream.getTracks()
                    ) {

                        track.stop();
                    }


                    await refreshDevices();

                } catch (
                    error
                ) {

                    console.error(
                        "[AudioSetup] Permission error:",
                        error
                    );


                    if (
                        error instanceof
                        DOMException
                    ) {

                        if (
                            error.name ===
                            "NotAllowedError"
                        ) {

                            setError(
                                "Microphone permission was denied. Allow microphone access and try again."
                            );

                        } else if (
                            error.name ===
                            "NotFoundError"
                        ) {

                            setError(
                                "No microphone was detected."
                            );

                        } else {

                            setError(
                                error.message
                            );
                        }

                    } else {

                        setError(
                            "Unable to access your microphone."
                        );
                    }

                } finally {

                    setIsLoading(
                        false
                    );
                }

            },
            [
                refreshDevices,
            ]
        );


    useEffect(
        () => {

            void prepareDevices();

        },
        [
            prepareDevices,
        ]
    );


    /*
     * ============================================================
     * Microphone test
     * ============================================================
     */

    const testMicrophone =
        async () => {

            if (
                !selectedMicrophone
            ) {

                setError(
                    "Select a microphone first."
                );


                return;
            }


            setIsLoading(
                true
            );


            setError(
                null
            );


            setMicrophoneReady(
                false
            );


            try {

                const stream =
                    await navigator.mediaDevices
                        .getUserMedia({

                            audio: {

                                deviceId: {

                                    exact:
                                        selectedMicrophone,
                                },

                                echoCancellation:
                                    true,

                                noiseSuppression:
                                    true,

                                autoGainControl:
                                    true,
                            },

                            video:
                                false,
                        });


                const track =
                    stream.getAudioTracks()[0];


                if (
                    !track ||
                    track.readyState !==
                        "live"
                ) {

                    throw new Error(
                        "The selected microphone could not be activated."
                    );
                }


                /*
                 * Test actual audio signal.
                 */

                const AudioContextClass =
                    window.AudioContext ??
                    (
                        window as typeof window & {
                            webkitAudioContext?:
                                typeof AudioContext;
                        }
                    ).webkitAudioContext;


                if (!AudioContextClass) {

                    throw new Error(
                        "Audio testing is not supported by this browser."
                    );
                }


                const audioContext =
                    new AudioContextClass();


                const source =
                    audioContext
                        .createMediaStreamSource(
                            stream
                        );


                const analyser =
                    audioContext
                        .createAnalyser();


                analyser.fftSize =
                    2048;


                source.connect(
                    analyser
                );


                const data =
                    new Float32Array(
                        analyser.fftSize
                    );


                let peak =
                    0;


                /*
                 * Give the user 1.5 seconds to speak.
                 */

                const endAt =
                    Date.now() +
                    1500;


                while (
                    Date.now() <
                    endAt
                ) {

                    analyser.getFloatTimeDomainData(
                        data
                    );


                    for (
                        let i = 0;
                        i < data.length;
                        i++
                    ) {

                        peak =
                            Math.max(
                                peak,
                                Math.abs(
                                    data[i]
                                )
                            );
                    }


                    await new Promise<void>(
                        resolve =>
                            setTimeout(
                                resolve,
                                50
                            )
                    );
                }


                source.disconnect();


                await audioContext.close();


                for (
                    const track of
                    stream.getTracks()
                ) {

                    track.stop();
                }


                console.log(
                    "[AudioSetup] Microphone test:",
                    {
                        device:
                            track.label,

                        peak,
                    }
                );


                if (
                    peak <
                    0.005
                ) {

                    throw new Error(
                        "We could not detect your voice. Speak during the microphone test and try again."
                    );
                }


                setMicrophoneReady(
                    true
                );

            } catch (
                error
            ) {

                console.error(
                    "[AudioSetup] Microphone test failed:",
                    error
                );


                setMicrophoneReady(
                    false
                );


                setError(
                    error instanceof Error
                        ? error.message
                        : "Microphone test failed."
                );

            } finally {

                setIsLoading(
                    false
                );
            }
        };


    /*
     * ============================================================
     * Test / select speaker
     * ============================================================
     */

    const testSpeaker =
        async () => {

            setError(
                null
            );


            try {

                /*
                 * Prefer the browser's native output-device picker.
                 */

                const mediaDevices =
                    navigator.mediaDevices as
                    MediaDevices & {
                        selectAudioOutput?: () =>
                            Promise<MediaDeviceInfo>;
                    };


                if (
                    typeof mediaDevices
                        .selectAudioOutput ===
                    "function"
                ) {

                    const device =
                        await mediaDevices
                            .selectAudioOutput();


                    setSelectedSpeaker(
                        device.deviceId
                    );


                    setSpeakers(
                        previous => {

                            const exists =
                                previous.some(
                                    item =>
                                        item.deviceId ===
                                        device.deviceId
                                );


                            if (
                                exists
                            ) {

                                return previous;
                            }


                            return [
                                ...previous,

                                {
                                    deviceId:
                                        device.deviceId,

                                    label:
                                        device.label ||
                                        "Selected speaker",

                                    groupId:
                                        device.groupId,
                                },
                            ];
                        }
                    );


                    setSpeakerReady(
                        true
                    );


                    return;
                }


                /*
                 * Fallback when selectAudioOutput is unsupported.
                 *
                 * We can still use the browser default output.
                 */

                setSelectedSpeaker(
                    "default"
                );


                setSpeakerReady(
                    true
                );

            } catch (
                error
            ) {

                console.error(
                    "[AudioSetup] Speaker selection failed:",
                    error
                );


                setSpeakerReady(
                    false
                );


                if (
                    error instanceof
                    DOMException &&
                    error.name ===
                    "NotAllowedError"
                ) {

                    setError(
                        "Speaker selection was blocked by the browser."
                    );

                } else {

                    setError(
                        error instanceof Error
                            ? error.message
                            : "Unable to select the speaker."
                    );
                }
            }
        };


    /*
     * ============================================================
     * Continue
     * ============================================================
     */

    const handleContinue =
        () => {

            if (
                !selectedMicrophone
            ) {

                setError(
                    "Select a microphone before continuing."
                );


                return;
            }


            if (
                !microphoneReady
            ) {

                setError(
                    "Please test your microphone before continuing."
                );


                return;
            }


            /*
             * Speaker readiness is optional when the browser doesn't
             * provide explicit output selection.
             */

            const microphone =
                microphones.find(
                    device =>
                        device.deviceId ===
                        selectedMicrophone
                );


            const speaker =
                speakers.find(
                    device =>
                        device.deviceId ===
                        selectedSpeaker
                );


            onComplete({

                inputDeviceId:
                    selectedMicrophone,

                inputDeviceLabel:
                    microphone?.label ??
                    "Selected microphone",

                outputDeviceId:
                    selectedSpeaker,

                outputDeviceLabel:
                    speaker?.label ??
                    null,

            });
        };


    /*
     * ============================================================
     * UI
     * ============================================================
     */

    return (

        <div className="w-full max-w-2xl">

            <div className="rounded-2xl border border-[#26272C] bg-[#16171A] p-6 sm:p-8">

                <div className="mb-7">

                    <p className="font-data text-[10px] tracking-[0.2em] text-[#C9A24B] uppercase">
                        Audio setup
                    </p>


                    <h2 className="mt-2 font-display text-2xl font-medium text-[#F5F3EE]">
                        Check your interview audio
                    </h2>


                    <p className="mt-2 text-sm leading-6 text-[#8B8A85]">
                        Select the microphone you want to use and verify that
                        your voice is being detected before the interview starts.
                    </p>

                </div>


                <div className="space-y-6">

                    {/* Microphone */}

                    <div>

                        <label className="mb-2 block font-data text-[10px] tracking-[0.15em] text-[#8B8A85] uppercase">
                            Microphone
                        </label>


                        <select
                            value={
                                selectedMicrophone
                            }

                            onChange={
                                event => {

                                    setSelectedMicrophone(
                                        event.target.value
                                    );

                                    setMicrophoneReady(
                                        false
                                    );

                                    setError(
                                        null
                                    );
                                }
                            }

                            disabled={
                                isLoading
                            }

                            className="w-full rounded-lg border border-[#3A3B41] bg-[#111214] px-4 py-3 text-sm text-[#F5F3EE] outline-none focus:border-[#C9A24B]"
                        >

                            <option
                                value=""
                                disabled
                            >
                                Select a microphone
                            </option>


                            {microphones.map(
                                device => (

                                    <option
                                        key={
                                            device.deviceId
                                        }
                                        value={
                                            device.deviceId
                                        }
                                    >
                                        {
                                            friendlyDeviceLabel(
                                                device.label
                                            )
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    {/* Microphone test */}

                    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#26272C] bg-[#111214] p-4">

                        <div>

                            <p className="text-sm text-[#F5F3EE]">
                                Microphone test
                            </p>


                            <p className="mt-1 text-xs text-[#8B8A85]">
                                Say “I am ready for the interview.”
                            </p>

                        </div>


                        <Button
                            type="button"
                            onClick={
                                testMicrophone
                            }
                            disabled={
                                isLoading ||
                                !selectedMicrophone
                            }
                            className="shrink-0 rounded-md bg-[#C9A24B] text-[#111214] hover:bg-[#DAB768]"
                        >
                            Test mic
                        </Button>

                    </div>


                    {microphoneReady && (

                        <div className="flex items-center gap-2 rounded-lg border border-[#3F5B44] bg-[#3F5B44]/10 px-4 py-3 text-sm text-[#7DB08B]">

                            <span className="h-2 w-2 rounded-full bg-[#5E8869]" />

                            Microphone is working.

                        </div>
                    )}


                    {/* Speaker */}

                    <div>

                        <label className="mb-2 block font-data text-[10px] tracking-[0.15em] text-[#8B8A85] uppercase">
                            Speaker
                        </label>


                        <select
                            value={
                                selectedSpeaker ??
                                ""
                            }

                            onChange={
                                event => {

                                    setSelectedSpeaker(
                                        event.target.value ||
                                        null
                                    );

                                    setSpeakerReady(
                                        false
                                    );
                                }
                            }

                            className="w-full rounded-lg border border-[#3A3B41] bg-[#111214] px-4 py-3 text-sm text-[#F5F3EE] outline-none focus:border-[#C9A24B]"
                        >

                            <option
                                value=""
                            >
                                Default system speaker
                            </option>


                            {speakers.map(
                                device => (

                                    <option
                                        key={
                                            device.deviceId
                                        }
                                        value={
                                            device.deviceId
                                        }
                                    >
                                        {
                                            friendlyDeviceLabel(
                                                device.label
                                            )
                                        }
                                    </option>

                                )
                            )}

                        </select>

                    </div>


                    <div className="flex items-center justify-between gap-4 rounded-lg border border-[#26272C] bg-[#111214] p-4">

                        <div>

                            <p className="text-sm text-[#F5F3EE]">
                                Speaker test
                            </p>


                            <p className="mt-1 text-xs text-[#8B8A85]">
                                Choose your headset or laptop speakers.
                            </p>

                        </div>


                        <Button
                            type="button"
                            variant="outline"
                            onClick={
                                testSpeaker
                            }
                            disabled={
                                isLoading
                            }
                            className="shrink-0 border-[#3A3B41] bg-transparent text-[#D4D1C9] hover:bg-[#1A1B20]"
                        >
                            Select speaker
                        </Button>

                    </div>


                    {speakerReady && (

                        <div className="flex items-center gap-2 rounded-lg border border-[#3F5B44] bg-[#3F5B44]/10 px-4 py-3 text-sm text-[#7DB08B]">

                            <span className="h-2 w-2 rounded-full bg-[#5E8869]" />

                            Speaker selection is ready.

                        </div>
                    )}


                    {error && (

                        <div className="rounded-lg border border-[#C0665A]/30 bg-[#C0665A]/[0.08] px-4 py-3 text-sm text-[#D89A8D]">

                            {error}

                        </div>

                    )}


                    <div className="flex items-center justify-end gap-3 pt-2">

                        {onCancel && (

                            <Button
                                type="button"
                                variant="outline"
                                onClick={
                                    onCancel
                                }
                                disabled={
                                    isLoading
                                }
                                className="border-[#3A3B41] bg-transparent text-[#B8B6B0] hover:bg-[#1A1B20]"
                            >
                                Back
                            </Button>

                        )}


                        <Button
                            type="button"
                            onClick={
                                handleContinue
                            }
                            disabled={
                                isLoading ||
                                !selectedMicrophone ||
                                !microphoneReady
                            }
                            className="min-w-40 rounded-md bg-[#C9A24B] text-[#111214] font-semibold hover:bg-[#DAB768]"
                        >
                            Continue
                        </Button>

                    </div>

                </div>

            </div>

        </div>
    );
}


/*
|--------------------------------------------------------------------------
| Helpers
|--------------------------------------------------------------------------
*/

function isVirtualDevice(
    label: string
): boolean {

    const value =
        label.toLowerCase();


    return (
        value.includes("monitor") ||
        value.includes("loopback") ||
        value.includes("stereo mix") ||
        value.includes("what u hear") ||
        value.includes("virtual cable") ||
        value.includes("voicemeeter")
    );
}


function friendlyDeviceLabel(
    label: string
): string {

    if (
        !label
    ) {

        return "Audio device";
    }


    return label;
}