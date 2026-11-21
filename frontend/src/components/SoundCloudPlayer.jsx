
import { useEffect, useRef, useState } from "react";
import "./SoundCloudPlayer.css";

const PLAYLIST_URL =
  "https://soundcloud.com/tracebundy/sets/trace-bundy-sampler";

let soundCloudApiPromise;

function loadSoundCloudApi() {
  if (window.SC?.Widget) return Promise.resolve(window.SC);

  if (!soundCloudApiPromise) {
    soundCloudApiPromise = new Promise((resolve, reject) => {
      let script = document.getElementById("soundcloud-widget-api");

      if (!script) {
        script = document.createElement("script");
        script.id = "soundcloud-widget-api";
        script.src = "https://w.soundcloud.com/player/api.js";
        document.body.appendChild(script);
      }

      script.addEventListener("load", () => resolve(window.SC), {
        once: true,
      });

      script.addEventListener("error", reject, { once: true });
    });
  }

  return soundCloudApiPromise;
}

export default function SoundCloudPlayer() {
  const iframeRef = useRef(null);
  const widgetRef = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [trackName, setTrackName] = useState("Cargando música...");
  const [volume, setVolume] = useState(35);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let active = true;
    let widget;
    let widgetReady = false;
    let userInteracted = false;

    const handleFirstInteraction = () => {
      if (userInteracted) return;

      userInteracted = true;

      if (widgetReady && widget) {
        widget.play();
      }

      document.removeEventListener(
        "pointerdown",
        handleFirstInteraction
      );

      document.removeEventListener(
        "keydown",
        handleFirstInteraction
      );
    };

    document.addEventListener(
      "pointerdown",
      handleFirstInteraction
    );

    document.addEventListener(
      "keydown",
      handleFirstInteraction
    );

    loadSoundCloudApi()
      .then((SC) => {
        if (!active || !iframeRef.current) return;

        widget = SC.Widget(iframeRef.current);
        widgetRef.current = widget;

        const events = SC.Widget.Events;

        widget.bind(events.READY, () => {
          if (!active) return;

          widgetReady = true;

          setIsReady(true);
          widget.setVolume(volume);

          if (userInteracted) {
            widget.play();
          }

          widget.getCurrentSound((sound) => {
            if (active && sound) {
              setTrackName(sound.title);
            }
          });
        });

        widget.bind(events.PLAY, () => {
          if (!active) return;

          setIsPlaying(true);

          widget.getCurrentSound((sound) => {
            if (active && sound) {
              setTrackName(sound.title);
            }
          });
        });

        widget.bind(events.PAUSE, () => {
          if (active) setIsPlaying(false);
        });

        widget.bind(events.FINISH, () => {
          if (active) setIsPlaying(false);
        });
      })
      .catch((error) => {
        console.error("Error al cargar SoundCloud:", error);

        if (active) {
          setTrackName("No se pudo cargar la música");
        }
      });

    return () => {
      active = false;

      document.removeEventListener(
        "pointerdown",
        handleFirstInteraction
      );

      document.removeEventListener(
        "keydown",
        handleFirstInteraction
      );

      widgetRef.current = null;
    };
  }, []);

  const togglePlayback = () => {
    const widget = widgetRef.current;
    if (!widget) return;

    if (isPlaying) {
      widget.pause();
    } else {
      widget.play();
    }
  };

  const nextTrack = () => {
    widgetRef.current?.next();
  };

  const previousTrack = () => {
    widgetRef.current?.prev();
  };

  const changeVolume = (event) => {
    const newVolume = Number(event.target.value);

    setVolume(newVolume);
    widgetRef.current?.setVolume(newVolume);
  };

  const playerUrl =
    `https://w.soundcloud.com/player/?url=${encodeURIComponent(PLAYLIST_URL)}` +
    "&auto_play=false&hide_related=true&show_comments=false" +
    "&show_user=false&show_reposts=false&show_teaser=false" +
    "&visual=false&show_artwork=false&sharing=false";

  return (
    <>
      <iframe
        ref={iframeRef}
        title="Reproductor de música del camping"
        src={playerUrl}
        allow="autoplay"
        className="soundcloud-hidden-frame"
      />

      <div className="camping-player">
        <div className="camping-player-info">
          <div className="camping-player-icon">
            <span>♫</span>
          </div>

          <div className="camping-player-track">
            <span className="camping-player-label">
              MÚSICA AMBIENTAL
            </span>

            <span className="camping-player-title" title={trackName}>
              {trackName}
            </span>
          </div>
        </div>

        <div className="camping-player-controls">
          <button
            type="button"
            onClick={previousTrack}
            disabled={!isReady}
            aria-label="Canción anterior"
          >
            |◀
          </button>

          <button
            type="button"
            className="camping-player-main-button"
            onClick={togglePlayback}
            disabled={!isReady}
            aria-label={isPlaying ? "Pausar música" : "Reproducir música"}
          >
            {isPlaying ? "Ⅱ" : "▶"}
          </button>

          <button
            type="button"
            onClick={nextTrack}
            disabled={!isReady}
            aria-label="Siguiente canción"
          >
            ▶|
          </button>
        </div>

        <div className="camping-player-volume">
          <span aria-hidden="true">♪</span>

          <input
            type="range"
            min="0"
            max="100"
            value={volume}
            onChange={changeVolume}
            aria-label="Volumen"
            style={{ "--volume": `${volume}%` }}
          />
        </div>

        <a
          className="camping-player-credit"
          href={PLAYLIST_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Escuchar Trace Bundy en SoundCloud"
        >
          SoundCloud
        </a>
      </div>
    </>
  );
}
