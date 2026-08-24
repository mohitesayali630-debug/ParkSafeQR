import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/Dashboard/Profile.css";

import {
  FaArrowLeft,
  FaUserCircle,
  FaUser,
  FaEnvelope,
  FaPhoneAlt,
  FaTint,
  FaHeartbeat,
  FaLock,
  FaUsers,
} from "react-icons/fa";

function Profile() {
  const navigate = useNavigate();

  // =====================================================
  // EDIT MODE
  // =====================================================

  const [editMode, setEditMode] = useState(() => {
    const savedEditMode = sessionStorage.getItem(
      "parksafe_profile_edit_mode"
    );

    return savedEditMode === "true";
  });

  // =====================================================
  // USER
  // =====================================================

  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser.user_id ||
    storedUser.id ||
    1;

  // =====================================================
  // DEFAULT PROFILE DATA
  // =====================================================

  const defaultProfileData = {
    fullName:
      storedUser.full_name ||
      storedUser.fullName ||
      storedUser.name ||
      "User",

    email:
      storedUser.email ||
      "",

    mobile:
      storedUser.mobile_number ||
      storedUser.mobile ||
      storedUser.phone ||
      "",

    bloodGroup: "B+",

    medicalInfo: "None",

    privacy: "Private",
  };

  // =====================================================
  // PROFILE STATE
  // =====================================================

  const [profileData, setProfileData] = useState(
    defaultProfileData
  );

  // =====================================================
  // EMERGENCY CONTACTS STATE
  // =====================================================

  const [emergencyContacts, setEmergencyContacts] =
    useState([]);

  const [contactsLoading, setContactsLoading] =
    useState(true);

  // =====================================================
  // NORMALIZE CONTACT DATA
  // =====================================================

  const normalizeContacts = (responseData) => {
    let contacts = [];

    // -----------------------------------------------
    // Direct array
    // -----------------------------------------------

    if (Array.isArray(responseData)) {
      contacts = responseData;
    }

    // -----------------------------------------------
    // { contacts: [] }
    // -----------------------------------------------

    else if (
      responseData &&
      Array.isArray(responseData.contacts)
    ) {
      contacts = responseData.contacts;
    }

    // -----------------------------------------------
    // { data: [] }
    // -----------------------------------------------

    else if (
      responseData &&
      Array.isArray(responseData.data)
    ) {
      contacts = responseData.data;
    }

    // -----------------------------------------------
    // { results: [] }
    // -----------------------------------------------

    else if (
      responseData &&
      Array.isArray(responseData.results)
    ) {
      contacts = responseData.results;
    }

    return contacts.map((contact, index) => ({
      id:
        contact.id ||
        contact.contact_id ||
        contact._id ||
        index,

      name:
        contact.name ||
        contact.full_name ||
        contact.fullName ||
        contact.contact_name ||
        contact.contactName ||
        contact.person_name ||
        contact.personName ||
        "Emergency Contact",

      phone:
        contact.phone ||
        contact.mobile ||
        contact.mobile_number ||
        contact.phone_number ||
        contact.contact_number ||
        contact.number ||
        "",
    }));
  };

  // =====================================================
  // FETCH PROFILE + EMERGENCY CONTACTS
  // =====================================================

  useEffect(() => {
    const fetchProfileAndContacts = async () => {
      setContactsLoading(true);

      // =================================================
      // PROFILE
      // =================================================

      try {
        const profRes = await fetch(
          `http://127.0.0.1:8000/api/profile/${userId}/`
        );

        if (profRes.ok) {
          const prof = await profRes.json();

          setProfileData({
            fullName:
              prof.fullName ||
              prof.full_name ||
              prof.name ||
              defaultProfileData.fullName,

            email:
              prof.email ||
              defaultProfileData.email,

            mobile:
              prof.mobile ||
              prof.mobile_number ||
              prof.phone ||
              defaultProfileData.mobile,

            bloodGroup:
              prof.bloodGroup ||
              prof.blood_group ||
              "B+",

            medicalInfo:
              prof.medicalInfo ||
              prof.medical_info ||
              "None",

            privacy:
              prof.privacy ||
              "Private",
          });
        }
      } catch (e) {
        console.log(
          "Error loading profile from backend:",
          e
        );
      }

      // =================================================
      // EMERGENCY CONTACTS
      // =================================================

      try {
        const contRes = await fetch(
          `http://127.0.0.1:8000/api/contacts/${userId}/`
        );

        if (contRes.ok) {
          const responseData =
            await contRes.json();

          const contacts =
            normalizeContacts(responseData);

          console.log(
            "ParkSafe Emergency Contacts:",
            contacts
          );

          setEmergencyContacts(contacts);

          sessionStorage.setItem(
            "parksafe_emergency_contacts_saved",
            JSON.stringify(contacts)
          );
        } else {
          throw new Error(
            "Unable to load emergency contacts"
          );
        }
      } catch (e) {
        console.log(
          "Error loading contacts from backend:",
          e
        );

        // ---------------------------------------------
        // FALLBACK TO SESSION STORAGE
        // ---------------------------------------------

        try {
          const savedContacts =
            sessionStorage.getItem(
              "parksafe_emergency_contacts_saved"
            );

          if (savedContacts) {
            const parsedContacts =
              JSON.parse(savedContacts);

            const contacts =
              normalizeContacts(parsedContacts);

            setEmergencyContacts(contacts);
          }
        } catch (storageError) {
          console.log(
            "Unable to load saved contacts:",
            storageError
          );
        }
      } finally {
        setContactsLoading(false);
      }
    };

    fetchProfileAndContacts();
  }, [userId]);

  // =====================================================
  // HANDLE PROFILE CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfileData((prev) => {
      const updatedData = {
        ...prev,
        [name]: value,
      };

      sessionStorage.setItem(
        "parksafe_profile_draft",
        JSON.stringify(updatedData)
      );

      return updatedData;
    });
  };

  // =====================================================
  // MANAGE EMERGENCY CONTACTS
  // =====================================================

  const handleManageContacts = () => {
    navigate("/emergency-contacts");
  };

  // =====================================================
  // EDIT / SAVE
  // =====================================================

  const handleButton = () => {
    // -----------------------------------------------
    // ENTER EDIT MODE
    // -----------------------------------------------

    if (!editMode) {
      setEditMode(true);

      sessionStorage.setItem(
        "parksafe_profile_edit_mode",
        "true"
      );

      return;
    }

    // -----------------------------------------------
    // FINAL SAVE
    // -----------------------------------------------

    let finalProfileData = profileData;

    try {
      const latestProfileDraft =
        sessionStorage.getItem(
          "parksafe_profile_draft"
        );

      if (latestProfileDraft) {
        finalProfileData =
          JSON.parse(latestProfileDraft);
      }
    } catch (error) {
      console.log(
        "Unable to read profile draft:",
        error
      );
    }

    console.log(
      "Final Profile Data:",
      finalProfileData
    );

    console.log(
      "Final Emergency Contacts:",
      emergencyContacts
    );

    // -----------------------------------------------
    // SAVE PROFILE
    // -----------------------------------------------

    sessionStorage.setItem(
      "parksafe_profile_saved",
      JSON.stringify(finalProfileData)
    );

    // -----------------------------------------------
    // SAVE CONTACTS
    // -----------------------------------------------

    sessionStorage.setItem(
      "parksafe_emergency_contacts_saved",
      JSON.stringify(emergencyContacts)
    );

    // -----------------------------------------------
    // REMOVE DRAFTS
    // -----------------------------------------------

    sessionStorage.removeItem(
      "parksafe_profile_draft"
    );

    sessionStorage.removeItem(
      "parksafe_emergency_contacts_draft"
    );

    // -----------------------------------------------
    // RESET EDIT MODE
    // -----------------------------------------------

    sessionStorage.removeItem(
      "parksafe_profile_edit_mode"
    );

    setEditMode(false);

    alert(
      "Profile Updated Successfully!"
    );

    // -----------------------------------------------
    // IMPORTANT:
    // SAVE NANTAR SETTINGS PAGE
    // -----------------------------------------------

    navigate("/settings");
  };

  // =====================================================
  // BACK BUTTON
  // =====================================================

  const handleBack = () => {
    if (editMode) {
      const confirmExit = window.confirm(
        "Your unsaved changes will be lost. Do you want to leave?"
      );

      if (!confirmExit) {
        return;
      }

      sessionStorage.removeItem(
        "parksafe_profile_draft"
      );

      sessionStorage.removeItem(
        "parksafe_emergency_contacts_draft"
      );

      sessionStorage.removeItem(
        "parksafe_profile_edit_mode"
      );

      setEditMode(false);
    }

    // =================================================
    // IMPORTANT CHANGE
    // PROFILE -> SETTINGS
    // =================================================

    navigate("/settings");
  };

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="profile-page">

      <div className="profile-card">

        {/* =================================================
            HEADER
        ================================================= */}

        <div className="profile-header">

          <button
            className="back-btn"
            onClick={handleBack}
            type="button"
          >
            <FaArrowLeft />
          </button>

          <h2 className="profile-title">
            Profile
          </h2>

        </div>

        {/* =================================================
            PROFILE PHOTO
        ================================================= */}

        <div className="profile-image-section">

          <FaUserCircle className="profile-avatar" />

          <h3>
            {profileData.fullName}
          </h3>

        </div>

        {/* =================================================
            INFORMATION
        ================================================= */}

        <div className="profile-info">

          {/* FULL NAME */}

          <div className="info-group">

            <label>
              <FaUser className="info-icon" />
              Full Name
            </label>

            <input
              type="text"
              name="fullName"
              value={profileData.fullName}
              onChange={handleChange}
              disabled={!editMode}
            />

          </div>

          {/* EMAIL */}

          <div className="info-group">

            <label>
              <FaEnvelope className="info-icon" />
              Email
            </label>

            <input
              type="email"
              value={profileData.email}
              disabled
            />

          </div>

          {/* MOBILE */}

          <div className="info-group">

            <label>
              <FaPhoneAlt className="info-icon" />
              Mobile Number
            </label>

            <input
              type="text"
              value={profileData.mobile}
              disabled
            />

          </div>

          {/* BLOOD GROUP */}

          <div className="info-group">

            <label>
              <FaTint className="info-icon" />
              Blood Group
            </label>

            <select
              name="bloodGroup"
              value={profileData.bloodGroup}
              onChange={handleChange}
              disabled={!editMode}
            >

              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>

            </select>

          </div>

          {/* MEDICAL INFORMATION */}

          <div className="info-group">

            <label>
              <FaHeartbeat className="info-icon" />
              Medical Emergency
            </label>

            <select
              name="medicalInfo"
              value={profileData.medicalInfo}
              onChange={handleChange}
              disabled={!editMode}
            >

              <option value="None">
                None
              </option>

              <option value="Diabetes">
                Diabetes
              </option>

              <option value="Blood Pressure">
                Blood Pressure
              </option>

              <option value="Heart Patient">
                Heart Patient
              </option>

              <option value="Asthma">
                Asthma
              </option>

              <option value="Epilepsy">
                Epilepsy
              </option>

              <option value="Allergy">
                Allergy
              </option>

              <option value="Pregnant">
                Pregnant
              </option>

              <option value="Other">
                Other
              </option>

            </select>

          </div>

          {/* PRIVACY */}

          <div className="info-group">

            <label>
              <FaLock className="info-icon" />
              Privacy
            </label>

            <select
              name="privacy"
              value={profileData.privacy}
              onChange={handleChange}
              disabled={!editMode}
            >

              <option value="Private">
                Private
              </option>

              <option value="Public">
                Public
              </option>

            </select>

          </div>

          {/* =================================================
              EMERGENCY CONTACTS
          ================================================= */}

          <div className="info-group">

            <label>
              <FaUsers className="info-icon" />
              Emergency Contacts
            </label>

            {/* MANAGE BOX */}

            <div
              className={`manage-contact-box ${
                !editMode
                  ? "disabled-contact"
                  : ""
              }`}
              onClick={
                editMode
                  ? handleManageContacts
                  : undefined
              }
            >

              <span>
                {contactsLoading
                  ? "Loading contacts..."
                  : `${emergencyContacts.length} ${
                      emergencyContacts.length === 1
                        ? "Contact"
                        : "Contacts"
                    } Added`}
              </span>

              <span className="manage-arrow">
                Manage →
              </span>

            </div>

            {/* =================================================
                ACTUAL CONTACT LIST
            ================================================= */}

            {!contactsLoading &&
              emergencyContacts.length > 0 && (

                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "10px",
                  }}
                >

                  {emergencyContacts.map(
                    (contact, index) => (

                      <div
                        key={
                          contact.id ||
                          index
                        }
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent:
                            "space-between",
                          gap: "12px",
                          padding:
                            "13px 15px",
                          border:
                            "1px solid #dce7f5",
                          borderRadius:
                            "12px",
                          background:
                            "#f8fbff",
                          boxSizing:
                            "border-box",
                        }}
                      >

                        <div
                          style={{
                            display:
                              "flex",
                            alignItems:
                              "center",
                            gap: "12px",
                            minWidth: 0,
                          }}
                        >

                          <div
                            style={{
                              width: "38px",
                              height: "38px",
                              minWidth:
                                "38px",
                              borderRadius:
                                "50%",
                              background:
                                "#eaf4ff",
                              display:
                                "flex",
                              alignItems:
                                "center",
                              justifyContent:
                                "center",
                              color:
                                "#1677ed",
                            }}
                          >
                            <FaUser />
                          </div>

                          <div
                            style={{
                              minWidth: 0,
                            }}
                          >

                            <div
                              style={{
                                fontWeight:
                                  "700",
                                color:
                                  "#173b66",
                                fontSize:
                                  "14px",
                              }}
                            >
                              {contact.name}
                            </div>

                            <div
                              style={{
                                marginTop:
                                  "3px",
                                color:
                                  "#7188a2",
                                fontSize:
                                  "13px",
                              }}
                            >
                              {contact.phone ||
                                "Phone number not available"}
                            </div>

                          </div>

                        </div>

                        {editMode && (
                          <button
                            type="button"
                            onClick={
                              handleManageContacts
                            }
                            style={{
                              border:
                                "none",
                              background:
                                "transparent",
                              color:
                                "#1677ed",
                              fontWeight:
                                "700",
                              cursor:
                                "pointer",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            Edit
                          </button>
                        )}

                      </div>

                    )
                  )}

                </div>
              )}

            {/* NO CONTACTS */}

            {!contactsLoading &&
              emergencyContacts.length === 0 && (

                <div
                  style={{
                    marginTop: "10px",
                    padding:
                      "13px 15px",
                    borderRadius:
                      "12px",
                    background:
                      "#f8fbff",
                    border:
                      "1px dashed #cbdced",
                    color:
                      "#8095aa",
                    fontSize:
                      "13px",
                    textAlign:
                      "center",
                  }}
                >
                  No emergency contacts added yet.
                </div>

              )}

          </div>

        </div>

        {/* =================================================
            BUTTON
        ================================================= */}

        <button
          className="profile-btn"
          onClick={handleButton}
          type="button"
        >
          {editMode
            ? "Save Changes"
            : "Edit Profile"}
        </button>

      </div>

    </div>
  );
}

export default Profile;