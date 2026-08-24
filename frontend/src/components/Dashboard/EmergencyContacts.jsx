import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import "../../css/Dashboard/EmergencyContacts.css";

import {
  FaArrowLeft,
  FaUsers,
  FaPlus,
  FaUser,
  FaPhone,
  FaEdit,
  FaTrash
} from "react-icons/fa";

function EmergencyContacts() {

  const navigate = useNavigate();

  // ==========================
  // Emergency Contacts
  // ==========================

  const [contacts, setContacts] = useState([]); 


 useEffect(() => {

  const savedContacts = sessionStorage.getItem(
    "parksafe_emergency_contacts_saved"
  );

  if (savedContacts) {

    try {

      setContacts(JSON.parse(savedContacts));

    } catch (error) {

      console.log(
        "Emergency contacts loading error:",
        error
      );

      setContacts([]);

    }

  } else {

    setContacts([]);

  }

}, []);

  const [editingIndex, setEditingIndex] = useState(null);

  // ==========================
  // Show / Hide Form
  // ==========================

  const [showForm, setShowForm] = useState(false);

  // ==========================
  // New Contact
  // ==========================

  const [newContact, setNewContact] = useState({
    name: "",
    number: ""
  });


  // ==========================
  // Add Contact
  // ==========================

  const handleAddContact = () => {

    if (
      newContact.name.trim() === "" ||
      newContact.number.trim() === ""
    ) {

      alert("Please enter all fields.");

      return;

    }

    if (!/^[6-9]\d{9}$/.test(newContact.number)) {

      alert("Enter valid mobile number.");

      return;

    }

          const updatedContacts = [
        ...contacts,
        newContact
      ];

      setContacts(updatedContacts);

      sessionStorage.setItem(
        "parksafe_emergency_contacts_saved",
        JSON.stringify(updatedContacts)
      );

    setNewContact({

      name: "",

      number: ""

    });

    setShowForm(false);

  };


  const handleEdit = (index) => {
    setEditingIndex(index);

    setNewContact({
        name: contacts[index].name,
        number: contacts[index].number
    });

    setShowForm(true);
};

const handleSaveEdit = () => {

    if (
        newContact.name.trim() === "" ||
        newContact.number.trim() === ""
    ) {
        alert("Please enter all fields.");
        return;
    }

    if (!/^[6-9]\d{9}$/.test(newContact.number)) {
        alert("Enter valid mobile number.");
        return;
    }

    const updatedContacts = [...contacts];

    updatedContacts[editingIndex] = {
        name: newContact.name,
        number: newContact.number
    };

    setContacts(updatedContacts);

        sessionStorage.setItem(
      "parksafe_emergency_contacts_saved",
      JSON.stringify(updatedContacts)
    );

setEditingIndex(null);

    setNewContact({
        name: "",
        number: ""
    });

    setShowForm(false);
};


  // ==========================
  // Delete Contact
  // ==========================

  const handleDelete = (index) => {

    const updatedContacts = contacts.filter(

      (_, i) => i !== index

    );

    setContacts(updatedContacts);
    sessionStorage.setItem(
  "parksafe_emergency_contacts_saved",
  JSON.stringify(updatedContacts)
);

    };

  return (

    <div className="emergency-page">

      <div className="emergency-card">

        {/* ================= HEADER ================= */}

        <div className="emergency-header">

          <button
            className="back-btn"
            onClick={() => navigate("/profile")}
          >
            <FaArrowLeft />
          </button>
          

          <h2 className="emergency-title">
            Emergency Contacts
          </h2>

        </div>

        {/* ================= TOP SECTION ================= */}

            <div className="top-section">

              <FaUsers className="top-icon" />

              <p>
                Keep your trusted people ready
                during emergencies.
              </p>


            </div>
              {/* ================= Add Contact Button ================= */}{/* ================= Add Contact ================= */}

              <button
                className="add-contact-btn"
                onClick={() => setShowForm(!showForm)}
              >
                <FaPlus />

                {showForm ? "Cancel" : "Add New Contact"}

              </button>        

        

        {/* ================= Form ================= */}

        {

          showForm && (

            <div className="contact-form">

              <input
                    type="text"
                    name="name"
                    placeholder="Contact Name"
                    value={newContact.name}
                    onChange={(e) => {
                        const value = e.target.value;

                        if (/^[A-Za-z ]*$/.test(value)) {
                            setNewContact({
                                ...newContact,
                                name: value
                            });
                        }
                    }}
                />

              <input
                  type="text"
                  name="number"
                  placeholder="Mobile Number"
                  maxLength="10"
                  value={newContact.number}
                  onChange={(e) => {
                      const value = e.target.value;

                      if (/^\d*$/.test(value) && value.length <= 10) {
                          setNewContact({
                              ...newContact,
                              number: value
                          });
                      }
                  }}
              />

              <button
                  className="save-btn"
                  onClick={editingIndex !== null ? handleSaveEdit : handleAddContact}
              >
                  {editingIndex !== null ? "Save Changes" : "Save Contact"}
              </button>

            </div>

          )

        }

        

                {/* ================= Empty State ================= */}

        {contacts.length === 0 ? (

          <div className="empty-state">

            <FaUsers className="empty-icon" />

            <h3>No Contacts Added</h3>

            <p>
              Add your first emergency contact
              to keep your loved ones safe.
            </p>

          </div>

        ) : (

          <div className="contact-list">

            {contacts.map((contact, index) => (

              <div
                className="contact-card-box"
                key={index}
              >

                <div className="contact-info">

                  <h4>

                    <FaUser className="card-icon" />

                    {contact.name}

                  </h4>

                  <p>

                    <FaPhone className="card-icon" />

                    {contact.number}

                  </p>

                </div>

                <div className="contact-actions">

                  <button
                      className="edit-btn"
                      onClick={() => handleEdit(index)}
                  >
                      <FaEdit />
                      Edit
                  </button>

                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(index)}
                  >

                    <FaTrash />

                    Delete

                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

export default EmergencyContacts;