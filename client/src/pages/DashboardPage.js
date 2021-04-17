import React, { useEffect, useRef, useState } from "react";
import { Redirect } from "react-router";
import axios from "axios";
import { MoreOutlined, SendOutlined } from "@ant-design/icons";
import { Modal, Button, Card, Input, notification } from "antd";
import Avatar from "antd/lib/avatar/avatar";
import Meta from "antd/lib/card/Meta";
import Search from "antd/lib/input/Search";
import { ROUTES, PATH } from "../configs/routes";
import Message from "../components/message";

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
  const [top, setTop] = useState(0);
  const [ownerId, setOwnerId] = useState("");

  const refContainer = useRef();

  const onScroll = () => {
    setTop(refContainer.current.scrollTop);
  };

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
  const deleteRoomHandler = async () => {
    if (activeRoomId) {
      console.log("here");
      await axios
        .delete(PATH + "/delete-room", {
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
          data: { id: activeRoomId },
        })
        .then((res) => {
          socket.emit("roomDeleted");
          setMessages([]);
          setActiveRoomName("");
          setActiveRoomId("");
          notification.success({
            message: res.data.message,
            onClick: () => {
              console.log("Notification Clicked!");
            },
          });
        })
        .catch((err) => {
          notification.error({
            message: err.response?.data,
            onClick: () => {
              console.log("Notification Clicked!");
            },
          });
        });
    }
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
            notification.error({ message: error?.response?.data?.message });
            throw error;
          }
        }
      );
      socket.on("roomDeleted", () => {
        getChatrooms();
      });
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
        throw e.response.data.message;
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
  const mappedList = chatrooms?.map((listItem) => {
    let description = "";
    const sliceLength = 20;
    if (listItem.messages) {
      description =
        listItem.messages[listItem.messages.length - 1]?.text.length >
        sliceLength
          ? listItem.messages[listItem.messages.length - 1]?.text.slice(
              0,
              sliceLength
            ) + "..."
          : listItem.messages[listItem.messages.length - 1]?.text;
    }
    const isActiveRoom = activeRoomId === listItem._id;
    return (
      <Card
        key={listItem._id}
        style={{
          margin: "1rem 1rem 0",
          border: "1px solid blue",
          backgroundColor: isActiveRoom ? "rgba(0,0,0,0.06)" : "",
          borderLeft: isActiveRoom ? "3px solid blue" : "1px solid blue",
        }}
        onClick={() => {
          if (isActiveRoom) return;
          setPreviousRoomId(activeRoomId);
          setActiveRoomId(listItem._id);
          setMessages(listItem.messages);
          setOwnerId(listItem.owner);
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

  const mappedMessages = messages.map((message, index) => {
    return (
      <Message key={index + 1} top={top} userId={userId} message={message} />
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
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div>
          {" "}
          Dashboard{" "}
          <Button
            style={{ margin: "0 1rem" }}
            onClick={() => setVisible(true)}
            type="primary"
          >
            Create room
          </Button>
          {activeRoomId && ownerId === userId && (
            <Button onClick={() => deleteRoomHandler()} type="primary">
              Delete room
            </Button>
          )}
        </div>
        <div
          style={{
            fontSize: "1rem",
            display: "inline-flex",
            alignItems: "center",
          }}
        >
          <h5>
            {name}
            <style jsx>{`
              h5:hover {
                cursor: pointer;
                color: blue;
              }
            `}</style>
          </h5>
          <MoreOutlined
            style={{
              margin: "0 0 0 1rem",
              padding: "0.5rem",
              cursor: "pointer",
            }}
          />
        </div>
      </div>
      <div style={{ display: "flex" }}>
        <div
          className="room-list-container"
          style={{
            flexBasis: "30%",
            height: "90vh",
            padding: "1rem 0 0 0",
            border: "1px solid green",
            backgroundColor: "#fafafa",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: `0 ${chatrooms.length >= 6 ? 1.3 : 1}rem 0 1rem`,
            }}
          >
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
          <div
            onScroll={onScroll}
            ref={refContainer}
            style={{ overflow: "auto", height: "60vh" }}
          >
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
            value={roomName}
          />
        }
      </Modal>
    </div>
  ) : (
    <Redirect to={ROUTES.login} />
  );
}

export default DashboardPage;
