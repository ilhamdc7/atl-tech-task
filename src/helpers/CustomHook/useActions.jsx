import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeCallState } from "../../redux/reducers/callStateReducer";
import { formatter } from "../formatter";

export const useActions = (remoteAudioRef, localAudioRef) => {
  const callState = useSelector((data) => data.callState.callstate);
  const dispatch = useDispatch();
  const [seconds, setSeconds] = useState(0);

  const [users, setUsers] = useState([]);
  const [muted, setMuted] = useState(false);
  const [callAlert, setCallAlert] = useState("");
  const [targetId, setTargetId] = useState(null);
  const [incomingCaller, setIncomingCaller] = useState(null);
  const myId = useRef(crypto.randomUUID());
  const bc = useRef(null);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteStreamRef = useRef(null);

  const timeData = formatter(seconds);

  const countUp = () => {
    const interval = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  };

  const addUser = (id) => {
    setUsers((prev) =>
      prev.includes(id) || id === myId.current ? prev : [...prev, id]
    );
  };

  const removeUser = (id) => {
    setUsers((prev) => prev.filter((uid) => uid !== id));
  };

  useEffect(() => {
    if (seconds > 0) {
      setCallAlert(timeData);
    }
  }, [timeData]);

  useEffect(() => {
    bc.current = new BroadcastChannel("multiuser_channel");

    bc.current.onmessage = async (e) => {
      const msg = e.data;
      const { type, from, to, offer, answer, candidate } = msg;

      if (to && to !== myId.current) return;

      switch (type) {
        case "join":
          bc.current.postMessage({ type: "i_am_here", id: myId.current });
          addUser(from);
          break;

        case "i_am_here":
          addUser(from);
          break;

        case "leave":
          removeUser(from);
          break;

        case "call":
          if (callState === "idle") {
            dispatch(changeCallState("ringing"));
            setIncomingCaller(from);
          }
          break;

        case "cancel":
          if (callState === "ringing") {
            setCallAlert("Zəng ləğv edildi");
            setTimeout(() => {
              dispatch(changeCallState("idle"));
              setCallAlert("");
            }, 3000);
          } else if (callState === "connected") {
            localStreamRef.current
              ?.getTracks()
              .forEach((track) => track.stop());
            setSeconds(0);
            setCallAlert("Zəng sonlandırıldı");
            setTimeout(() => {
              dispatch(changeCallState("idle"));
            }, 3000);
          }
          break;

        case "rejected":
          if (callState === "calling") {
            setCallAlert("Zəng rədd edildi");
            setTimeout(() => {
              dispatch(changeCallState("idle"));
              setCallAlert("");
            }, 3000);
          }
          break;

        case "accept":
          if (callState === "calling") {
            dispatch(changeCallState("connected"));
            countUp();
            await setupPeer(true);
          }
          break;

        case "offer":
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(offer)
          );
          const createdAnswer = await peerRef.current.createAnswer();
          await peerRef.current.setLocalDescription(createdAnswer);
          bc.current.postMessage({
            type: "answer",
            answer: createdAnswer,
            from: myId.current,
            to: from,
          });
          dispatch(changeCallState("connected"));
          break;

        case "answer":
          await peerRef.current.setRemoteDescription(
            new RTCSessionDescription(answer)
          );
          dispatch(changeCallState("connected"));
          break;

        case "ice":
          try {
            await peerRef.current.addIceCandidate(candidate);
          } catch (err) {
            console.log(err);
          }
          break;

        default:
          break;
      }
    };

    bc.current.postMessage({ type: "join", from: myId.current });

    const leave = () => {
      bc.current.postMessage({ type: "leave", from: myId.current });
    };

    window.addEventListener("beforeunload", leave);
    return () => {
      leave();
      bc.current.close();
      window.removeEventListener("beforeunload", leave);
    };
  }, [callState]);

  const setupPeer = async (isCaller) => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;

    localAudioRef.current.srcObject = stream;
    localAudioRef.current.muted = false;
    await localAudioRef.current.play();

    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate && targetId) {
        bc.current.postMessage({
          type: "ice",
          candidate: e.candidate,
          from: myId.current,
          to: targetId,
        });
      }
    };

    pc.ontrack = (e) => {
      if (!remoteStreamRef.current) {
        remoteStreamRef.current = new MediaStream();
        remoteAudioRef.current.srcObject = remoteStreamRef.current;
        remoteAudioRef.current.play().catch(console.error);
      }
      remoteStreamRef.current.addTrack(e.track);
    };

    peerRef.current = pc;

    if (isCaller && targetId) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      bc.current.postMessage({
        type: "offer",
        offer,
        from: myId.current,
        to: targetId,
      });
    }
  };

  const callUser = (id) => {
    if (id === myId.current) return;
    setTargetId(id);
    dispatch(changeCallState("calling"));
    bc.current.postMessage({ type: "call", from: myId.current, to: id });
  };

  const cancelCall = () => {
    bc.current.postMessage({
      type: "cancel",
      from: myId.current,
      to: targetId,
    });
    dispatch(changeCallState("idle"));
    setTargetId(null);
    localStreamRef.current?.getTracks().forEach((track) => track.stop());
  };

  const rejectCall = ({}) => {
    bc.current.postMessage({
      type: "rejected",
      from: myId.current,
      to: incomingCaller,
    });
    dispatch(changeCallState("idle"));
    setIncomingCaller(null);
  };

  const acceptCall = async () => {
    bc.current.postMessage({
      type: "accept",
      from: myId.current,
      to: incomingCaller,
    });
    dispatch(changeCallState("connected"));
    setTargetId(incomingCaller);
    countUp();
    await setupPeer(false);
  };

  const toggleMute = () => {
    const audioTrack = localStreamRef.current
      ?.getAudioTracks()
      ?.find((track) => track.kind === "audio");

    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      setMuted(!audioTrack.enabled);
    }
  };

  return {
    users,
    callUser,
    cancelCall,
    rejectCall,
    acceptCall,
    toggleMute,
    muted,
    callAlert,
  };
};
