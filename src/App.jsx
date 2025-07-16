import React, { useEffect } from "react";
import { MainScreen } from "./layout/MainScreen";
import { CallScreen } from "./layout/CallScreen";
import { RenderIf } from "./helpers/RenderIf";
import { useDispatch, useSelector } from "react-redux";
import { changeCallState } from "./redux/reducers/callStateReducer";
const App = () => {
  const callState = useSelector((data) => data.callState.callstate);
  const dispatch = useDispatch();
  console.log(callState);
  useEffect(() => {
    dispatch(changeCallState("idle"));
  }, []);

  return (
    <>
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "100vh", background: "#f8f9fa" }}
      >
        <div className="w-100" style={{ maxWidth: "420px" }}>
          <div className="bg-white  shadow rounded" style={{ height: "95vh" }}>
            <RenderIf condition={callState === "idle"}>
              <MainScreen />
            </RenderIf>
            <RenderIf
              condition={
                callState === "calling" ||
                callState === "ringing" ||
                callState === "connected"
              }
            >
              <CallScreen callState={callState} />
            </RenderIf>
          </div>
        </div>
      </div>
    </>
  );
};

export default App;
