import { useEffect, useMemo, useState } from "react";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../firebase/config";
import "./TeamFinder.css";

function TeamFinder({ userId, onBack }) {
  // =========================================================
  // STUDENTS
  // =========================================================
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  // =========================================================
  // CURRENT USER
  // =========================================================
  const [currentUserProfile, setCurrentUserProfile] =
    useState(null);

  // =========================================================
  // SEARCH + FILTERS
  // =========================================================
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSkill, setSelectedSkill] =
    useState("All");
  const [selectedInterest, setSelectedInterest] =
    useState("All");

  // =========================================================
  // PROFILE MODAL
  // =========================================================
  const [selectedStudent, setSelectedStudent] =
    useState(null);

  // =========================================================
  // OUTGOING REQUESTS
  // =========================================================
  const [outgoingRequests, setOutgoingRequests] =
    useState({});

  // =========================================================
  // INCOMING REQUESTS
  // =========================================================
  const [incomingRequests, setIncomingRequests] =
    useState([]);

  const [incomingRequestStatuses, setIncomingRequestStatuses] =
    useState({});

  // =========================================================
  // ACCEPTED CONNECTIONS
  // =========================================================
  const [outgoingConnections, setOutgoingConnections] =
    useState([]);

  const [incomingConnections, setIncomingConnections] =
    useState([]);

  // =========================================================
  // BUTTON STATES
  // =========================================================
  const [sendingRequest, setSendingRequest] =
    useState(null);

  const [processingRequest, setProcessingRequest] =
    useState(null);

  // =========================================================
  // LOAD CURRENT USER PROFILE
  // =========================================================
  useEffect(() => {
    if (!userId) {
      setCurrentUserProfile(null);
      return;
    }

    const loadCurrentUser = async () => {
      try {
        const userRef = doc(db, "users", userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
          setCurrentUserProfile(snapshot.data());
        }
      } catch (error) {
        console.error(
          "Error loading current user:",
          error
        );
      }
    };

    loadCurrentUser();
  }, [userId]);

  // =========================================================
  // LOAD ALL COMPLETED STUDENTS
  // =========================================================
  useEffect(() => {
    if (!userId) {
      setStudents([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    const usersQuery = query(
      collection(db, "users"),
      where("onboardingCompleted", "==", true)
    );

    const unsubscribe = onSnapshot(
      usersQuery,
      (snapshot) => {
        const studentList = snapshot.docs
          .map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          }))
          .filter(
            (student) =>
              student.uid !== userId &&
              student.id !== userId
          );

        setStudents(studentList);
        setLoading(false);
      },
      (error) => {
        console.error(
          "Error loading students:",
          error
        );

        setStudents([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // =========================================================
  // LOAD OUTGOING REQUESTS
  // =========================================================
  useEffect(() => {
    if (!userId) {
      setOutgoingRequests({});
      setOutgoingConnections([]);
      return;
    }

    const outgoingQuery = query(
      collection(db, "collaborationRequests"),
      where("senderId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      outgoingQuery,
      (snapshot) => {
        const requestMap = {};
        const accepted = [];

        snapshot.docs.forEach((docSnapshot) => {
          const request = {
            id: docSnapshot.id,
            ...docSnapshot.data(),
          };

          if (request.receiverId) {
            requestMap[request.receiverId] =
              request.status;
          }

          if (request.status === "accepted") {
            accepted.push(request);
          }
        });

        setOutgoingRequests(requestMap);
        setOutgoingConnections(accepted);
      },
      (error) => {
        console.error(
          "Error loading outgoing requests:",
          error
        );

        setOutgoingRequests({});
        setOutgoingConnections([]);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // =========================================================
  // LOAD INCOMING REQUESTS
  // =========================================================
  useEffect(() => {
    if (!userId) {
      setIncomingRequests([]);
      setIncomingRequestStatuses({});
      setIncomingConnections([]);
      return;
    }

    const incomingQuery = query(
      collection(db, "collaborationRequests"),
      where("receiverId", "==", userId)
    );

    const unsubscribe = onSnapshot(
      incomingQuery,
      (snapshot) => {
        const allRequests = snapshot.docs.map(
          (docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
          })
        );

        const pendingRequests =
          allRequests.filter(
            (request) =>
              request.status === "pending"
          );

        const accepted = allRequests.filter(
          (request) =>
            request.status === "accepted"
        );

        const statusMap = {};

        allRequests.forEach((request) => {
          if (request.senderId) {
            statusMap[request.senderId] =
              request.status;
          }
        });

        setIncomingRequests(pendingRequests);
        setIncomingRequestStatuses(statusMap);
        setIncomingConnections(accepted);
      },
      (error) => {
        console.error(
          "Error loading incoming requests:",
          error
        );

        setIncomingRequests([]);
        setIncomingRequestStatuses({});
        setIncomingConnections([]);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  // =========================================================
  // BUILD CONNECTION LIST
  // =========================================================
  const connections = useMemo(() => {
    const connectionMap = new Map();

    // Outgoing accepted requests
    outgoingConnections.forEach((request) => {
      if (!request.receiverId) {
        return;
      }

      connectionMap.set(request.receiverId, {
        id: request.receiverId,
        name:
          request.receiverName ||
          "PathPilot Student",
        career:
          request.receiverCareer ||
          "Career explorer",
      });
    });

    // Incoming accepted requests
    incomingConnections.forEach((request) => {
      if (!request.senderId) {
        return;
      }

      connectionMap.set(request.senderId, {
        id: request.senderId,
        name:
          request.senderName ||
          "PathPilot Student",
        career:
          request.senderCareer ||
          "Career explorer",
      });
    });

    return Array.from(
      connectionMap.values()
    );
  }, [
    outgoingConnections,
    incomingConnections,
  ]);

  // =========================================================
  // COLLECT ALL SKILLS
  // =========================================================
  const allSkills = useMemo(() => {
    const skillSet = new Set();

    students.forEach((student) => {
      if (Array.isArray(student.skills)) {
        student.skills.forEach((skill) => {
          if (skill) {
            skillSet.add(String(skill));
          }
        });
      }
    });

    return [
      "All",
      ...Array.from(skillSet).sort(),
    ];
  }, [students]);

  // =========================================================
  // COLLECT ALL INTERESTS
  // =========================================================
  const allInterests = useMemo(() => {
    const interestSet = new Set();

    students.forEach((student) => {
      if (Array.isArray(student.interests)) {
        student.interests.forEach((interest) => {
          if (interest) {
            interestSet.add(
              String(interest)
            );
          }
        });
      }
    });

    return [
      "All",
      ...Array.from(interestSet).sort(),
    ];
  }, [students]);

  // =========================================================
  // NORMALIZE ARRAYS
  // =========================================================
  const normalizeArray = (items) => {
    if (!Array.isArray(items)) {
      return [];
    }

    return items
      .filter(Boolean)
      .map((item) =>
        String(item)
          .trim()
          .toLowerCase()
      );
  };

  // =========================================================
  // CALCULATE MATCH SCORE
  // =========================================================
  const calculateMatch = (student) => {
    const mySkills = normalizeArray(
      currentUserProfile?.skills
    );

    const studentSkills = normalizeArray(
      student.skills
    );

    const myInterests = normalizeArray(
      currentUserProfile?.interests
    );

    const studentInterests =
      normalizeArray(
        student.interests
      );

    // -------------------------------------------------------
    // SKILLS
    // -------------------------------------------------------

    const skillUnion = new Set([
      ...mySkills,
      ...studentSkills,
    ]);

    const sharedSkills =
      studentSkills.filter((skill) =>
        mySkills.includes(skill)
      );

    const skillSimilarity =
      skillUnion.size > 0
        ? sharedSkills.length /
          skillUnion.size
        : 0;

    // -------------------------------------------------------
    // INTERESTS
    // -------------------------------------------------------

    const interestUnion = new Set([
      ...myInterests,
      ...studentInterests,
    ]);

    const sharedInterests =
      studentInterests.filter(
        (interest) =>
          myInterests.includes(interest)
      );

    const interestSimilarity =
      interestUnion.size > 0
        ? sharedInterests.length /
          interestUnion.size
        : 0;

    // -------------------------------------------------------
    // SAME CAREER
    // -------------------------------------------------------

    const sameCareer =
      currentUserProfile?.career &&
      student.career &&
      String(currentUserProfile.career)
        .trim()
        .toLowerCase() ===
        String(student.career)
          .trim()
          .toLowerCase();

    // -------------------------------------------------------
    // SAME FIELD
    // -------------------------------------------------------

    const sameField =
      currentUserProfile?.field &&
      student.field &&
      String(currentUserProfile.field)
        .trim()
        .toLowerCase() ===
        String(student.field)
          .trim()
          .toLowerCase();

    // -------------------------------------------------------
    // FINAL SCORE
    // -------------------------------------------------------

    const score = Math.round(
      skillSimilarity * 45 +
        interestSimilarity * 30 +
        (sameCareer ? 15 : 0) +
        (sameField ? 10 : 0)
    );

    return {
      score: Math.min(score, 100),
      sharedSkills,
      sharedInterests,
      sameCareer,
      sameField,
    };
  };

  // =========================================================
  // FILTER + SORT STUDENTS
  // =========================================================
  const filteredStudents = useMemo(() => {
    const normalizedSearch =
      searchTerm.trim().toLowerCase();

    return students
      .filter((student) => {
        const skills = Array.isArray(
          student.skills
        )
          ? student.skills
          : [];

        const interests =
          Array.isArray(
            student.interests
          )
            ? student.interests
            : [];

        const searchableText = [
          student.name,
          student.email,
          student.field,
          student.career,
          ...skills,
          ...interests,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        const matchesSearch =
          !normalizedSearch ||
          searchableText.includes(
            normalizedSearch
          );

        const matchesSkill =
          selectedSkill === "All" ||
          skills.some(
            (skill) =>
              String(skill).toLowerCase() ===
              selectedSkill.toLowerCase()
          );

        const matchesInterest =
          selectedInterest === "All" ||
          interests.some(
            (interest) =>
              String(
                interest
              ).toLowerCase() ===
              selectedInterest.toLowerCase()
          );

        return (
          matchesSearch &&
          matchesSkill &&
          matchesInterest
        );
      })
      .sort(
        (a, b) =>
          calculateMatch(b).score -
          calculateMatch(a).score
      );
  }, [
    students,
    searchTerm,
    selectedSkill,
    selectedInterest,
    currentUserProfile,
  ]);

  // =========================================================
  // SEND REQUEST
  // =========================================================
  const handleConnect = async (
    student
  ) => {
    if (!userId || !student?.id) {
      return;
    }

    try {
      setSendingRequest(student.id);

      const requestId =
        `${userId}_${student.id}`;

      const requestRef = doc(
        db,
        "collaborationRequests",
        requestId
      );

      const requestData = {
        senderId: userId,
        receiverId: student.id,

        senderName:
          currentUserProfile?.name ||
          "PathPilot Student",

        receiverName:
          student.name ||
          "PathPilot Student",

        senderCareer:
          currentUserProfile?.career ||
          "",

        receiverCareer:
          student.career ||
          "",

        status: "pending",

        updatedAt:
          serverTimestamp(),
      };

      if (!outgoingRequests[student.id]) {
        requestData.createdAt =
          serverTimestamp();
      }

      await setDoc(
        requestRef,
        requestData,
        {
          merge: true,
        }
      );
    } catch (error) {
      console.error(
        "Error sending collaboration request:",
        error
      );

      alert(
        "Unable to send the request. Please try again."
      );
    } finally {
      setSendingRequest(null);
    }
  };

  // =========================================================
  // ACCEPT / DECLINE REQUEST
  // =========================================================
  const handleRequestResponse = async (
    request,
    newStatus
  ) => {
    if (!request?.id) {
      return;
    }

    try {
      setProcessingRequest(
        request.id
      );

      const requestRef = doc(
        db,
        "collaborationRequests",
        request.id
      );

      await updateDoc(requestRef, {
        status: newStatus,
        updatedAt:
          serverTimestamp(),
      });
    } catch (error) {
      console.error(
        "Error updating collaboration request:",
        error
      );

      alert(
        "Unable to update the request. Please try again."
      );
    } finally {
      setProcessingRequest(null);
    }
  };

  // =========================================================
  // CONNECTION STATUS
  // =========================================================
  const getConnectionStatus = (
    student
  ) => {
    const outgoingStatus =
      outgoingRequests[student.id];

    const incomingStatus =
      incomingRequestStatuses[
        student.id
      ];

    if (
      outgoingStatus ===
        "accepted" ||
      incomingStatus === "accepted"
    ) {
      return "connected";
    }

    if (
      outgoingStatus === "pending"
    ) {
      return "pending";
    }

    if (
      incomingStatus === "pending"
    ) {
      return "received";
    }

    if (
      outgoingStatus ===
        "declined" ||
      incomingStatus === "declined"
    ) {
      return "declined";
    }

    return "none";
  };

  // =========================================================
  // INITIALS
  // =========================================================
  const getInitials = (name) => {
    return (name || "Student")
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  };

  // =========================================================
  // CONNECTION BUTTON
  // =========================================================
  const renderConnectionButton = (
    student
  ) => {
    const status =
      getConnectionStatus(student);

    const isSending =
      sendingRequest === student.id;

    // -------------------------------------------------------
    // CONNECTED
    // -------------------------------------------------------

    if (status === "connected") {
      return (
        <button
          type="button"
          className="student-connect-button"
          disabled
          style={{
            background:
              "linear-gradient(135deg, #6ecf9c, #54b989)",
            cursor: "default",
          }}
        >
          ✓ Connected
        </button>
      );
    }

    // -------------------------------------------------------
    // PENDING
    // -------------------------------------------------------

    if (status === "pending") {
      return (
        <button
          type="button"
          className="student-connect-button"
          disabled
          style={{
            background:
              "linear-gradient(135deg, #a999e8, #8c79d0)",
            cursor: "default",
          }}
        >
          ⏳ Pending
        </button>
      );
    }

    // -------------------------------------------------------
    // RECEIVED REQUEST
    // -------------------------------------------------------

    if (status === "received") {
      return (
        <button
          type="button"
          className="student-connect-button"
          style={{
            background:
              "linear-gradient(135deg, #f6cf71, #f89c74)",
          }}
          onClick={() => {
            const incoming =
              incomingRequests.find(
                (request) =>
                  request.senderId ===
                  student.id
              );

            if (incoming) {
              setSelectedStudent(
                student
              );
            }
          }}
        >
          View request →
        </button>
      );
    }

    // -------------------------------------------------------
    // DECLINED
    // -------------------------------------------------------

    if (status === "declined") {
      return (
        <button
          type="button"
          className="student-connect-button"
          disabled={isSending}
          onClick={() =>
            handleConnect(student)
          }
        >
          {isSending
            ? "Sending..."
            : "Connect again →"}
        </button>
      );
    }

    // -------------------------------------------------------
    // DEFAULT CONNECT
    // -------------------------------------------------------

    return (
      <button
        type="button"
        className="student-connect-button"
        disabled={isSending}
        onClick={() =>
          handleConnect(student)
        }
      >
        {isSending
          ? "Sending..."
          : "Connect →"}
      </button>
    );
  };

  // =========================================================
  // RENDER
  // =========================================================
  return (
    <div className="team-finder-page">

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="team-cloud team-cloud-one"></div>
      <div className="team-cloud team-cloud-two"></div>
      <div className="team-cloud team-cloud-three"></div>

      <div className="team-spark team-spark-one">
        ✦
      </div>

      <div className="team-spark team-spark-two">
        ✧
      </div>

      <div className="team-spark team-spark-three">
        ✦
      </div>

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <header className="team-finder-topbar">

        <button
          className="team-back-button"
          type="button"
          onClick={onBack}
        >
          ← Back to dashboard
        </button>

        <div className="team-brand">
          <span className="team-brand-icon">
            ✈
          </span>

          <span>
            PathPilot
          </span>
        </div>

      </header>

      <main className="team-finder-container">

        {/* ===================================================
            HERO
        =================================================== */}

        <section className="team-finder-hero">

          <div className="team-hero-copy">

            <span className="team-hero-badge">
              ✦ CAMPUS CONNECTIONS
            </span>

            <h1>
              Find your
              <span>
                project crew.
              </span>
            </h1>

            <p>
              Discover students who share
              your skills, interests and
              career goals — and find people
              you can build something great
              with.
            </p>

            <div className="team-hero-stats">

              <div className="team-stat">
                <strong>
                  {students.length}
                </strong>

                <span>
                  Students
                </span>
              </div>

              <div className="team-stat">
                <strong>
                  {allSkills.length > 1
                    ? allSkills.length - 1
                    : 0}
                </strong>

                <span>
                  Skills
                </span>
              </div>

              <div className="team-stat">
                <strong>
                  {allInterests.length > 1
                    ? allInterests.length - 1
                    : 0}
                </strong>

                <span>
                  Interests
                </span>
              </div>

            </div>

          </div>

          <div className="team-hero-visual">

            <div className="team-orbit orbit-a"></div>
            <div className="team-orbit orbit-b"></div>

            <div className="team-hero-plane">
              ✈️
            </div>

            <div className="team-person person-one">
              🧑🏻‍💻
            </div>

            <div className="team-person person-two">
              👩🏻‍🎨
            </div>

            <div className="team-person person-three">
              🧑🏻‍🔬
            </div>

            <div className="team-connection connection-one">
              •
            </div>

            <div className="team-connection connection-two">
              •
            </div>

            <div className="team-connection connection-three">
              •
            </div>

          </div>

        </section>

        {/* ===================================================
            YOUR CONNECTIONS
        =================================================== */}

        {connections.length > 0 && (
          <section
            style={{
              marginBottom: "32px",
              padding: "24px",
              borderRadius: "24px",
              background:
                "linear-gradient(135deg, #f4edff, #edfafa)",
              border:
                "1px solid rgba(83, 53, 114, 0.12)",
              boxShadow:
                "0 14px 35px rgba(60, 35, 90, 0.08)",
            }}
          >

            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                alignItems: "center",
                gap: "12px",
                marginBottom: "18px",
              }}
            >

              <div>

                <span
                  style={{
                    display: "block",
                    fontSize: "11px",
                    fontWeight: 800,
                    letterSpacing: "1.5px",
                    color: "#7d5a91",
                  }}
                >
                  YOUR NETWORK
                </span>

                <h2
                  style={{
                    margin:
                      "6px 0 0",
                    fontSize: "24px",
                    color:
                      "#2e2040",
                  }}
                >
                  Your connections
                </h2>

              </div>

              <span
                style={{
                  minWidth: "36px",
                  height: "36px",
                  padding:
                    "0 10px",
                  borderRadius:
                    "999px",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  background:
                    "#2e2040",
                  color:
                    "#ffffff",
                  fontWeight: 800,
                }}
              >
                {connections.length}
              </span>

            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "14px",
              }}
            >

              {connections.map(
                (connection) => (
                  <div
                    key={connection.id}
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: "13px",
                      padding:
                        "16px",
                      borderRadius:
                        "18px",
                      background:
                        "rgba(255,255,255,0.72)",
                      border:
                        "1px solid rgba(83, 53, 114, 0.10)",
                    }}
                  >

                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius:
                          "50%",
                        background:
                          "linear-gradient(135deg, #f89c74, #d8b7ff)",
                        display: "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "center",
                        color:
                          "#2e2040",
                        fontWeight: 800,
                        flexShrink: 0,
                      }}
                    >
                      {getInitials(
                        connection.name
                      )}
                    </div>

                    <div
                      style={{
                        minWidth:
                          0,
                      }}
                    >

                      <strong
                        style={{
                          display:
                            "block",
                          color:
                            "#2e2040",
                          fontSize:
                            "15px",
                        }}
                      >
                        {connection.name}
                      </strong>

                      <span
                        style={{
                          display:
                            "block",
                          marginTop:
                            "4px",
                          color:
                            "#765f84",
                          fontSize:
                            "13px",
                          whiteSpace:
                            "nowrap",
                          overflow:
                            "hidden",
                          textOverflow:
                            "ellipsis",
                        }}
                      >
                        {connection.career}
                      </span>

                      <span
                        style={{
                          display:
                            "inline-block",
                          marginTop:
                            "7px",
                          padding:
                            "4px 8px",
                          borderRadius:
                            "999px",
                          background:
                            "#e8f8ef",
                          color:
                            "#4b8d69",
                          fontSize:
                            "10px",
                          fontWeight:
                            800,
                        }}
                      >
                        ✓ CONNECTED
                      </span>

                    </div>

                  </div>
                )
              )}

            </div>

          </section>
        )}

        {/* ===================================================
            INCOMING REQUESTS
        =================================================== */}

        {incomingRequests.length > 0 && (
          <section
            style={{
              marginBottom:
                "32px",
              padding: "24px",
              borderRadius:
                "24px",
              background:
                "linear-gradient(135deg, #fff1ec, #f5edff)",
              border:
                "1px solid rgba(83, 53, 114, 0.12)",
              boxShadow:
                "0 14px 35px rgba(60, 35, 90, 0.08)",
            }}
          >

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                marginBottom:
                  "18px",
                gap: "12px",
              }}
            >

              <div>

                <span
                  style={{
                    fontSize:
                      "11px",
                    fontWeight:
                      800,
                    letterSpacing:
                      "1.5px",
                    color:
                      "#7d5a91",
                  }}
                >
                  TEAM REQUESTS
                </span>

                <h2
                  style={{
                    margin:
                      "6px 0 0",
                    fontSize:
                      "24px",
                    color:
                      "#2e2040",
                  }}
                >
                  Students who want to connect
                </h2>

              </div>

              <span
                style={{
                  minWidth:
                    "32px",
                  height:
                    "32px",
                  padding:
                    "0 10px",
                  borderRadius:
                    "999px",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  background:
                    "#2e2040",
                  color:
                    "#ffffff",
                  fontWeight:
                    800,
                }}
              >
                {incomingRequests.length}
              </span>

            </div>

            <div
              style={{
                display:
                  "grid",
                gap:
                  "14px",
              }}
            >

              {incomingRequests.map(
                (request) => {

                  const initials =
                    getInitials(
                      request.senderName
                    );

                  const isProcessing =
                    processingRequest ===
                    request.id;

                  return (
                    <div
                      key={request.id}
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "center",
                        justifyContent:
                          "space-between",
                        gap:
                          "18px",
                        flexWrap:
                          "wrap",
                        padding:
                          "18px",
                        borderRadius:
                          "18px",
                        background:
                          "rgba(255,255,255,0.75)",
                        border:
                          "1px solid rgba(83, 53, 114, 0.10)",
                      }}
                    >

                      <div
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          gap:
                            "14px",
                          minWidth:
                            0,
                        }}
                      >

                        <div
                          style={{
                            width:
                              "48px",
                            height:
                              "48px",
                            borderRadius:
                              "50%",
                            background:
                              "linear-gradient(135deg, #f89c74, #d8b7ff)",
                            display:
                              "flex",
                            alignItems:
                              "center",
                            justifyContent:
                              "center",
                            color:
                              "#2e2040",
                            fontWeight:
                              800,
                            flexShrink:
                              0,
                          }}
                        >
                          {initials}
                        </div>

                        <div>

                          <strong
                            style={{
                              display:
                                "block",
                              color:
                                "#2e2040",
                              fontSize:
                                "16px",
                            }}
                          >
                            {request.senderName ||
                              "PathPilot Student"}
                          </strong>

                          <span
                            style={{
                              display:
                                "block",
                              marginTop:
                                "4px",
                              color:
                                "#765f84",
                              fontSize:
                                "14px",
                            }}
                          >
                            {request.senderCareer
                              ? `${request.senderCareer} • wants to connect with you`
                              : "wants to connect with you"}
                          </span>

                        </div>

                      </div>

                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "10px",
                        }}
                      >

                        <button
                          type="button"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleRequestResponse(
                              request,
                              "accepted"
                            )
                          }
                          style={{
                            border:
                              "none",
                            borderRadius:
                              "12px",
                            padding:
                              "11px 18px",
                            background:
                              "#2e2040",
                            color:
                              "#ffffff",
                            fontWeight:
                              700,
                            cursor:
                              isProcessing
                                ? "default"
                                : "pointer",
                            opacity:
                              isProcessing
                                ? 0.6
                                : 1,
                          }}
                        >
                          {isProcessing
                            ? "..."
                            : "Accept"}
                        </button>

                        <button
                          type="button"
                          disabled={
                            isProcessing
                          }
                          onClick={() =>
                            handleRequestResponse(
                              request,
                              "declined"
                            )
                          }
                          style={{
                            border:
                              "1px solid rgba(46, 32, 64, 0.2)",
                            borderRadius:
                              "12px",
                            padding:
                              "11px 18px",
                            background:
                              "#ffffff",
                            color:
                              "#2e2040",
                            fontWeight:
                              700,
                            cursor:
                              isProcessing
                                ? "default"
                                : "pointer",
                            opacity:
                              isProcessing
                                ? 0.6
                                : 1,
                          }}
                        >
                          Decline
                        </button>

                      </div>

                    </div>
                  );
                }
              )}

            </div>

          </section>
        )}

        {/* ===================================================
            SEARCH / FILTER
        =================================================== */}

        <section className="team-discovery-bar">

          <div className="team-search-wrap">

            <span className="team-search-icon">
              ⌕
            </span>

            <input
              type="text"
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search students, skills, interests or careers..."
            />

            {searchTerm && (
              <button
                type="button"
                className="team-search-clear"
                onClick={() =>
                  setSearchTerm("")
                }
              >
                ×
              </button>
            )}

          </div>

          <div className="team-filter-row">

            <div className="team-filter">

              <label>
                Skill
              </label>

              <select
                value={selectedSkill}
                onChange={(event) =>
                  setSelectedSkill(
                    event.target.value
                  )
                }
              >
                {allSkills.map(
                  (skill) => (
                    <option
                      key={skill}
                      value={skill}
                    >
                      {skill}
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="team-filter">

              <label>
                Interest
              </label>

              <select
                value={selectedInterest}
                onChange={(event) =>
                  setSelectedInterest(
                    event.target.value
                  )
                }
              >
                {allInterests.map(
                  (interest) => (
                    <option
                      key={interest}
                      value={interest}
                    >
                      {interest}
                    </option>
                  )
                )}
              </select>

            </div>

            <div className="team-results-count">
              {filteredStudents.length}{" "}
              {filteredStudents.length ===
              1
                ? "student"
                : "students"}{" "}
              found
            </div>

          </div>

        </section>

        {/* ===================================================
            STUDENTS
        =================================================== */}

        <section className="team-student-section">

          <div className="team-section-heading">

            <div>

              <span>
                DISCOVER YOUR CAMPUS
              </span>

              <h2>
                Students you could build with
              </h2>

            </div>

            <p>
              Explore people by what they
              know, what they enjoy and
              what they want to build.
            </p>

          </div>

          {loading ? (

            <div className="team-loading">

              <div className="team-loading-plane">
                ✈️
              </div>

              <h3>
                Finding your campus crew...
              </h3>

              <p>
                Loading student profiles.
              </p>

            </div>

          ) : filteredStudents.length ===
            0 ? (

            <div className="team-empty">

              <div className="team-empty-icon">
                🧭
              </div>

              <h3>
                No students found
              </h3>

              <p>
                Try changing your search or
                filters to discover more
                students.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedSkill(
                    "All"
                  );
                  setSelectedInterest(
                    "All"
                  );
                }}
              >
                Clear filters
              </button>

            </div>

          ) : (

            <div className="team-student-grid">

              {filteredStudents.map(
                (student) => {

                  const skills =
                    Array.isArray(
                      student.skills
                    )
                      ? student.skills
                      : [];

                  const interests =
                    Array.isArray(
                      student.interests
                    )
                      ? student.interests
                      : [];

                  const match =
                    calculateMatch(
                      student
                    );

                  const initials =
                    getInitials(
                      student.name
                    );

                  const connectionStatus =
                    getConnectionStatus(
                      student
                    );

                  return (
                    <article
                      className="team-student-card"
                      key={student.id}
                    >

                      {/* TOP */}

                      <div className="student-card-top">

                        <div className="student-avatar">
                          {initials}
                        </div>

                        <div className="student-match">

                          <span>
                            MATCH
                          </span>

                          <strong>
                            {match.score}%
                          </strong>

                        </div>

                      </div>

                      {/* INFO */}

                      <div className="student-info">

                        <h3>
                          {student.name ||
                            "PathPilot Student"}
                        </h3>

                        <p className="student-career">
                          {student.career ||
                            "Career explorer"}
                        </p>

                        <span className="student-field">
                          {student.field ||
                            "CS Community"}
                        </span>

                      </div>

                      {/* WHY YOU MATCH */}

                      {(match.sharedSkills
                        .length > 0 ||
                        match.sharedInterests
                          .length > 0 ||
                        match.sameCareer ||
                        match.sameField) && (
                        <div
                          style={{
                            marginBottom:
                              "16px",
                            padding:
                              "12px 14px",
                            borderRadius:
                              "14px",
                            background:
                              "rgba(246, 207, 113, 0.12)",
                          }}
                        >

                          <span
                            style={{
                              display:
                                "block",
                              fontSize:
                                "10px",
                              fontWeight:
                                800,
                              letterSpacing:
                                "1px",
                              marginBottom:
                                "7px",
                              color:
                                "#8a6d24",
                            }}
                          >
                            WHY YOU MATCH
                          </span>

                          <div
                            style={{
                              display:
                                "flex",
                              flexWrap:
                                "wrap",
                              gap: "6px",
                            }}
                          >

                            {match.sameCareer && (
                              <span
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    "#fff4cf",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#71591c",
                                  fontWeight:
                                    700,
                                }}
                              >
                                Same career
                              </span>
                            )}

                            {match.sameField && (
                              <span
                                style={{
                                  padding:
                                    "5px 9px",
                                  borderRadius:
                                    "999px",
                                  background:
                                    "#f2e9ff",
                                  fontSize:
                                    "11px",
                                  color:
                                    "#68468e",
                                  fontWeight:
                                    700,
                                }}
                              >
                                Same field
                              </span>
                            )}

                            {match.sharedSkills
                              .slice(0, 2)
                              .map(
                                (skill) => (
                                  <span
                                    key={`shared-skill-${skill}`}
                                    style={{
                                      padding:
                                        "5px 9px",
                                      borderRadius:
                                        "999px",
                                      background:
                                        "#e9f8f8",
                                      fontSize:
                                        "11px",
                                      color:
                                        "#347a7d",
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                            {match.sharedInterests
                              .slice(0, 2)
                              .map(
                                (interest) => (
                                  <span
                                    key={`shared-interest-${interest}`}
                                    style={{
                                      padding:
                                        "5px 9px",
                                      borderRadius:
                                        "999px",
                                      background:
                                        "#ffe9e1",
                                      fontSize:
                                        "11px",
                                      color:
                                        "#9b5d46",
                                      fontWeight:
                                        700,
                                    }}
                                  >
                                    {interest}
                                  </span>
                                )
                              )}

                          </div>

                        </div>
                      )}

                      {/* SKILLS */}

                      {skills.length > 0 && (
                        <div className="student-card-block">

                          <span>
                            SKILLS
                          </span>

                          <div className="student-pill-row">

                            {skills
                              .slice(0, 4)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    className="student-pill skill"
                                    key={`${skill}-${index}`}
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                          </div>

                        </div>
                      )}

                      {/* INTERESTS */}

                      {interests.length > 0 && (
                        <div className="student-card-block">

                          <span>
                            INTERESTS
                          </span>

                          <div className="student-pill-row">

                            {interests
                              .slice(0, 3)
                              .map(
                                (
                                  interest,
                                  index
                                ) => (
                                  <span
                                    className="student-pill interest"
                                    key={`${interest}-${index}`}
                                  >
                                    {interest}
                                  </span>
                                )
                              )}

                          </div>

                        </div>
                      )}

                      {/* ACTIONS */}

                      <div
                        style={{
                          display:
                            "flex",
                          gap:
                            "10px",
                          marginTop:
                            "6px",
                        }}
                      >

                        <button
                          type="button"
                          className="student-connect-button"
                          style={{
                            flex: 1,
                          }}
                          onClick={() =>
                            setSelectedStudent(
                              student
                            )
                          }
                        >
                          View profile →
                        </button>

                        <div
                          style={{
                            flex: 1,
                          }}
                        >
                          {renderConnectionButton(
                            student
                          )}
                        </div>

                      </div>

                      {/* CONNECTED LABEL */}

                      {connectionStatus ===
                        "connected" && (
                        <div
                          style={{
                            marginTop:
                              "10px",
                            textAlign:
                              "center",
                            fontSize:
                              "12px",
                            fontWeight:
                              700,
                            color:
                              "#4c9a72",
                          }}
                        >
                          ✓ You are connected
                        </div>
                      )}

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

      </main>

      {/* =====================================================
          PROFILE MODAL
      ===================================================== */}

      {selectedStudent && (
        <div
          onClick={() =>
            setSelectedStudent(
              null
            )
          }
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            background:
              "rgba(35, 24, 48, 0.48)",
            backdropFilter:
              "blur(8px)",
            display: "flex",
            alignItems:
              "center",
            justifyContent:
              "center",
            padding: "20px",
          }}
        >

          <div
            onClick={(event) =>
              event.stopPropagation()
            }
            style={{
              width: "100%",
              maxWidth:
                "560px",
              maxHeight:
                "90vh",
              overflowY:
                "auto",
              borderRadius:
                "28px",
              background:
                "linear-gradient(145deg, #fffaf7, #f7efff)",
              boxShadow:
                "0 30px 80px rgba(30, 20, 45, 0.3)",
              padding:
                "28px",
              position:
                "relative",
            }}
          >

            {/* CLOSE */}

            <button
              type="button"
              onClick={() =>
                setSelectedStudent(
                  null
                )
              }
              style={{
                position:
                  "absolute",
                top:
                  "16px",
                right:
                  "16px",
                width:
                  "36px",
                height:
                  "36px",
                borderRadius:
                  "50%",
                border:
                  "none",
                background:
                  "rgba(46, 32, 64, 0.08)",
                color:
                  "#2e2040",
                fontSize:
                  "22px",
                cursor:
                  "pointer",
              }}
            >
              ×
            </button>

            {/* PROFILE HEADER */}

            <div
              style={{
                display:
                  "flex",
                alignItems:
                  "center",
                gap:
                  "16px",
                marginBottom:
                  "24px",
              }}
            >

              <div
                style={{
                  width:
                    "70px",
                  height:
                    "70px",
                  borderRadius:
                    "22px",
                  background:
                    "linear-gradient(135deg, #f89c74, #d7b7ff)",
                  display:
                    "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  color:
                    "#2e2040",
                  fontWeight:
                    900,
                  fontSize:
                    "22px",
                }}
              >
                {getInitials(
                  selectedStudent.name
                )}
              </div>

              <div>

                <span
                  style={{
                    fontSize:
                      "10px",
                    fontWeight:
                      800,
                    letterSpacing:
                      "1.5px",
                    color:
                      "#7d5a91",
                  }}
                >
                  PATHPILOT STUDENT
                </span>

                <h2
                  style={{
                    margin:
                      "4px 0",
                    color:
                      "#2e2040",
                    fontSize:
                      "25px",
                  }}
                >
                  {selectedStudent.name ||
                    "PathPilot Student"}
                </h2>

                <p
                  style={{
                    margin:
                      0,
                    color:
                      "#755f84",
                  }}
                >
                  {selectedStudent.career ||
                    "Career explorer"}
                </p>

              </div>

            </div>

            {/* FIELD */}

            <div
              style={{
                padding:
                  "15px 16px",
                borderRadius:
                  "16px",
                background:
                  "rgba(255,255,255,0.68)",
                marginBottom:
                  "16px",
              }}
            >

              <span
                style={{
                  fontSize:
                    "10px",
                  fontWeight:
                    800,
                  letterSpacing:
                    "1px",
                  color:
                    "#7d5a91",
                }}
              >
                FIELD
              </span>

              <p
                style={{
                  margin:
                    "5px 0 0",
                  color:
                    "#2e2040",
                  fontWeight:
                    700,
                }}
              >
                {selectedStudent.field ||
                  "Not specified"}
              </p>

            </div>

            {/* SKILLS */}

            <div
              style={{
                marginBottom:
                  "18px",
              }}
            >

              <span
                style={{
                  display:
                    "block",
                  fontSize:
                    "10px",
                  fontWeight:
                    800,
                  letterSpacing:
                    "1px",
                  color:
                    "#7d5a91",
                  marginBottom:
                    "9px",
                }}
              >
                SKILLS
              </span>

              <div
                style={{
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap:
                    "8px",
                }}
              >

                {(Array.isArray(
                  selectedStudent.skills
                )
                  ? selectedStudent.skills
                  : []
                ).map(
                  (
                    skill,
                    index
                  ) => (
                    <span
                      key={`${skill}-${index}`}
                      style={{
                        padding:
                          "8px 11px",
                        borderRadius:
                          "999px",
                        background:
                          "#e9f8f8",
                        color:
                          "#347a7d",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                      }}
                    >
                      {skill}
                    </span>
                  )
                )}

              </div>

            </div>

            {/* INTERESTS */}

            <div
              style={{
                marginBottom:
                  "24px",
              }}
            >

              <span
                style={{
                  display:
                    "block",
                  fontSize:
                    "10px",
                  fontWeight:
                    800,
                  letterSpacing:
                    "1px",
                  color:
                    "#7d5a91",
                  marginBottom:
                    "9px",
                }}
              >
                INTERESTS
              </span>

              <div
                style={{
                  display:
                    "flex",
                  flexWrap:
                    "wrap",
                  gap:
                    "8px",
                }}
              >

                {(Array.isArray(
                  selectedStudent.interests
                )
                  ? selectedStudent.interests
                  : []
                ).map(
                  (
                    interest,
                    index
                  ) => (
                    <span
                      key={`${interest}-${index}`}
                      style={{
                        padding:
                          "8px 11px",
                        borderRadius:
                          "999px",
                        background:
                          "#ffe9e1",
                        color:
                          "#9b5d46",
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                      }}
                    >
                      {interest}
                    </span>
                  )
                )}

              </div>

            </div>

            {/* MATCH */}

            {(() => {
              const match =
                calculateMatch(
                  selectedStudent
                );

              return (
                <div
                  style={{
                    padding:
                      "18px",
                    borderRadius:
                      "18px",
                    background:
                      "rgba(216,183,255,0.16)",
                    marginBottom:
                      "20px",
                  }}
                >

                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                    }}
                  >

                    <span
                      style={{
                        fontWeight:
                          800,
                        color:
                          "#60467b",
                      }}
                    >
                      Compatibility
                    </span>

                    <strong
                      style={{
                        fontSize:
                          "24px",
                        color:
                          "#2e2040",
                      }}
                    >
                      {match.score}%
                    </strong>

                  </div>

                  {(match.sharedSkills
                    .length > 0 ||
                    match.sharedInterests
                      .length > 0) && (
                    <p
                      style={{
                        margin:
                          "8px 0 0",
                        fontSize:
                          "13px",
                        color:
                          "#755f84",
                        lineHeight:
                          1.5,
                      }}
                    >
                      You share{" "}
                      {
                        match
                          .sharedSkills
                          .length
                      }{" "}
                      skill
                      {match.sharedSkills
                        .length !==
                      1
                        ? "s"
                        : ""}{" "}
                      and{" "}
                      {
                        match
                          .sharedInterests
                          .length
                      }{" "}
                      interest
                      {match.sharedInterests
                        .length !==
                      1
                        ? "s"
                        : ""}.
                    </p>
                  )}

                </div>
              );
            })()}

            {/* MODAL ACTION */}

            {renderConnectionButton(
              selectedStudent
            )}

          </div>

        </div>
      )}

    </div>
  );
}

export default TeamFinder;