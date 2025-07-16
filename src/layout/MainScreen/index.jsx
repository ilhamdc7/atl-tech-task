import React from "react";
import { useActions } from "../../helpers/CustomHook/useActions";
import styles from "./mainScreen.module.css";
export const MainScreen = () => {
  const { users, callUser } = useActions();
  return (
    <div className="w-100 h-100">
      <div className={styles.container}>
        <h1>ATL-Tech Softphone</h1>
      </div>
      <div
        className="w-100 p-4"
        style={{ height: "90vh", backgroundColor: "#fbf9e4" }}
      >
        <div className="w-100 h-100">
          {users?.map((data, index) => (
            <div
              key={index}
              className="w-100 d-flex align-items-center"
              style={{
                border: "grey 0.5px solid",
                position: "relative",
                marginTop: index > 0 ? "16px" : "0",
              }}
            >
              <img
                src="https://img.freepik.com/premium-vector/default-avatar-profile-icon-social-media-user-image-gray-avatar-icon-blank-profile-silhouette-vector-illustration_561158-3383.jpg"
                width={"40vh"}
                height={"40vh"}
                style={{ borderRadius: "50%" }}
              />
              <span style={{ marginLeft: "2%" }}>İstifadəçi {index + 1}</span>
              <div
                className="d-flex align-items-center justify-content-center"
                onClick={() => callUser(data)}
                style={{
                  position: "absolute",
                  right: "1vw",
                  cursor: "pointer",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  class="bi bi-telephone"
                  viewBox="0 0 16 16"
                >
                  <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.6 17.6 0 0 0 4.168 6.608 17.6 17.6 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.68.68 0 0 0-.58-.122l-2.19.547a1.75 1.75 0 0 1-1.657-.459L5.482 8.062a1.75 1.75 0 0 1-.46-1.657l.548-2.19a.68.68 0 0 0-.122-.58zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.68.68 0 0 0 .178.643l2.457 2.457a.68.68 0 0 0 .644.178l2.189-.547a1.75 1.75 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.6 18.6 0 0 1-7.01-4.42 18.6 18.6 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877z" />
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
