import React, { useEffect, useState } from "react";
import { Redirect } from "react-router";
import axios from "axios";
import { SendOutlined } from "@ant-design/icons";
import { Modal, Button, Card, Input, notification } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import Meta from "antd/lib/card/Meta";
import Search from "antd/lib/input/Search";
import { ROUTES, PATH } from "../configs/routes";

const userId = localStorage.getItem("userId");
const token = localStorage.getItem("token");
const name = localStorage.getItem("userName");

function DashboardPage({ socket }) {
  const [chatrooms, setChatrooms] = useState([]);
  const [visible, setVisible] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [activeRoomId, setActiveRoomId] = useState("");
  const [activeRoomName, setActiveRoomName] = useState("");
  const [previosRoomId, setPreviousRoomId] = useState("");
  const [messageToSend, setMessageToSend] = useState("");
  const [messages, setMessages] = useState([]);

  const sendMessage = () => {
    if (socket) {
      socket.emit(
        "chatroomMessage",
        {
          chatroomId: activeRoomId,
          message: messageToSend,
        },
        (error) => {
          if (error) {
            throw error;
          }
        }
      );
      setMessageToSend("");
    }
  };

  const getChatrooms = async () => {
    await axios
      .get(PATH + "/", {
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      })
      .then((res) => {
        setChatrooms(res.data.chatrooms);
      })
      .catch((err) => {
        notification.error({
          message: err.response?.data,
          onClick: () => {
            console.log("Notification Clicked!");
          },
        });
      });
  };

  useEffect(() => {
    getChatrooms();
  }, []);

  useEffect(() => {
    if (socket) {
      socket.on("newMessage", (data) => {
        setMessages((messages) => [...messages, data]);
      });
    }
  }, [socket]);

  useEffect(() => {
    if (socket && activeRoomId) {
      socket.emit(
        "joinRoom",
        { chatroomId: activeRoomId, userName: name },
        (error) => {
          if (error) {
            throw error;
          }
        }
      );
      return () => {
        socket.emit("leaveRoom", { chatroomId: previosRoomId });
      };
    }
  }, [activeRoomId, previosRoomId, socket]);

  // create room
  const handleOk = async () => {
    setVisible(false);
    await axios
      .post(
        PATH + "/",
        { name: roomName },
        {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        }
      )
      .then((res) => {
        setRoomName("");
        socket.emit("newRoomCreated");
        socket.on("newRoomCreated", () => {
          getChatrooms();
        });
        notification.success({ message: res.data.message });
      })
      .catch((e) => {
        setRoomName("");
        notification.error({ message: e.response.data.message });
      });
  };

  document.addEventListener("keyup", (e) => {
    if (e.key === "Escape") {
      setActiveRoomId("");
      setActiveRoomName("");
      setMessages([]);
    }
  });

  const enterHandler = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  const handleCancel = () => {
    console.log("Clicked cancel button");
    setRoomName("");
    setVisible(false);
  };
  const mappedList =
    chatrooms &&
    chatrooms.map((listItem) => {
      let description = "";
      if (listItem.messages) {
        description =
          listItem?.messages[listItem?.messages.length - 1]?.text.length > 25
            ? listItem?.messages[listItem?.messages.length - 1]?.text.slice(
                0,
                25
              ) + "..."
            : listItem?.messages[listItem?.messages.length - 1]?.text;
      }

      return (
        <Card
          key={listItem._id}
          style={{
            marginTop: 16,
            border: "1px solid blue",
            backgroundColor:
              activeRoomId === listItem._id ? "rgba(0,0,0,0.06)" : "",
          }}
          onClick={() => {
            if (activeRoomId === listItem._id) return;
            setPreviousRoomId(activeRoomId);
            setActiveRoomId(listItem._id);
            setMessages(listItem.messages);
            setActiveRoomName(listItem.name);
          }}
        >
          <Meta
            style={{ overflow: "elipsis" }}
            avatar={
              <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
            }
            title={listItem.name}
          />
          {description}
        </Card>
      );
    });

  const mappedMessages =
    messages &&
    messages.map((message, index) => {
      return (
        <div
          key={index}
          style={{
            display: "flex",
            alignItems: "center",
            marginLeft: "1rem",
          }}
        >
          <Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />
          <Card
            style={{
              margin: 16,
              border: "1px solid blue",
              borderRadius: "15px 16px 15px 0",
              backgroundColor: message.user === userId ? "" : "lightblue",
            }}
          >
            <Meta description={message.text} />
            {`number ${index + 1}`}
          </Card>
        </div>
      );
    });

  return token ? (
    <div
      style={{
        padding: "1rem",
        border: "1px solid green",
      }}
    >
      <div
        style={{
          padding: ".5rem",
          border: "1px solid green",
          display: "flex",
        }}
      >
        DashboardPage{" "}
        <Button onClick={() => setVisible(true)} type="primary">
          create room
        </Button>
      </div>
      <div style={{ display: "flex" }}>
        <div
          className="room-list-container"
          style={{
            flexBasis: "30%",
            height: "90vh",
            padding: "1rem",
            border: "1px solid green",
            backgroundColor: "#fafafa",
            overflow: "hidden",
          }}
        >
          <div>
            <Search
              bordered={true}
              placeholder="input search text"
              onSearch={() => {}}
              enterButton
              allowClear={true}
            />
          </div>
          <div
            className="room-list"
            style={{ marginTop: "1rem", overflow: "auto", height: "75vh" }}
          >
            <div>{mappedList}</div>
          </div>
        </div>
        <div
          className="message-container"
          style={{
            width: "100%",
            height: "90vh",
            border: "1px solid red",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "1rem",
              borderBottom: "1px solid red",
            }}
          >
            <h4>{activeRoomName ? activeRoomName : ""}</h4>
            <div
              style={{
                display: "flex",
                alignItems: "center",
              }}
            >
              <h5>{"Online: "}</h5>
              <div
                style={{
                  backgroundColor: socket?.connected ? "green" : "red",
                  width: "10px",
                  height: "10px",
                  margin: "0 5px 5px",
                  borderRadius: "50%",
                }}
              ></div>
            </div>
          </div>
          <div style={{ overflow: "auto", height: "60vh" }}>
            <div>{mappedMessages}</div>
          </div>
          {activeRoomId && (
            <div
              style={{
                bottom: 0,
                width: "100%",
                border: "2px cyan",
                padding: "2rem 6rem",
                position: "absolute",
                backgroundColor: "#fafafa",
              }}
            >
              <Input
                onKeyUp={(e) => enterHandler(e)}
                id="send-message"
                onChange={(e) => setMessageToSend(e.target.value)}
                size="large"
                value={messageToSend}
                allowClear={true}
                style={{ width: "100%" }}
                placeholder="Send message..."
                suffix={
                  <Button onClick={sendMessage}>
                    <SendOutlined />
                  </Button>
                }
              />
            </div>
          )}
        </div>
      </div>
      <Modal
        title="Title"
        visible={visible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        {
          <Input
            onChange={(e) => setRoomName(e.target.value)}
            placeholder="Chatroom name..."
          />
        }
      </Modal>
    </div>
  ) : (
    <Redirect to={ROUTES.login} />
  );
}

export default DashboardPage;
