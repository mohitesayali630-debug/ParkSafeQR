import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { API_BASE_URL } from "../../config";

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
  const location = useLocation();

  // ==========================
  // Logged-in User
  // ==========================
  const storedUser = JSON.parse(
    localStorage.getItem("parksafe_user") || "{}"
  );

  const userId =
    storedUser.user_id ||
    storedUser.id ||
    1;

  // ==========================
  // Emergency Contacts State
  // ==========================
  const [contacts, setContacts] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [newContact, setNewContact] = useState({
    name: "",
    number: ""
  });

  // ==========================
  // Fetch Contacts from DB
  // ==========================
  const fetchContacts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${userId}/`);
      if (response.ok) {
        const data = await response.json();
        setContacts(Array.isArray(data) ? data : []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Error fetching contacts:", errorData);
      }
    } catch (error) {
      console.error("Fetch emergency contacts failed:", error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchContacts();
    }
  }, [userId]);

  // ==========================
  // Add Contact (POST)
  // ==========================
  const handleAddContact = async () => {
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

    try {
      const response = await fetch(`${API_BASE_URL}/contacts/${userId}/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newContact.name.trim(),
          number: newContact.number.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setContacts((prev) => [
          ...prev,
          {
            id: data.id,
            name: data.name || newContact.name.trim(),
            number: data.number || newContact.number.trim(),
          },
        ]);
        setNewContact({
          name: "",
          number: "",
        });
        setShowForm(false);
        alert(data.message || "Contact added successfully");
      } else {
        alert(data.error || "Failed to add contact.");
      }
    } catch (error) {
      console.error("Add contact error:", error);
      alert("Server error: Unable to add contact.");
    }
  };

  // ==========================
  // Start Edit Contact
  // ==========================
  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewContact({
      name: contacts[index].name,
      number: contacts[index].number,
    });
    setShowForm(true);
  };

  // ==========================
  // Save Edited Contact (PUT)
  // ==========================
  const handleSaveEdit = async () => {
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

    const contactToEdit = contacts[editingIndex];
    if (!contactToEdit || !contactToEdit.id) {
      alert("Contact ID not found.");
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contact/${contactToEdit.id}/`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newContact.name.trim(),
          number: newContact.number.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        const updatedContacts = [...contacts];
        updatedContacts[editingIndex] = {
          ...contactToEdit,
          name: data.name || newContact.name.trim(),
          number: data.number || newContact.number.trim(),
        };
        setContacts(updatedContacts);
        setEditingIndex(null);
        setNewContact({
          name: "",
          number: "",
        });
        setShowForm(false);
        alert(data.message || "Contact updated successfully");
      } else {
        alert(data.error || "Failed to update contact.");
      }
    } catch (error) {
      console.error("Update contact error:", error);
      alert("Server error: Unable to update contact.");
    }
  };

  // ==========================
  // Delete Contact (DELETE)
  // ==========================
  const handleDelete = async (index) => {
    const contactToDelete = contacts[index];
    if (!contactToDelete || !contactToDelete.id) {
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${contactToDelete.name}?`
    );
    if (!confirmDelete) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/contact/${contactToDelete.id}/`, {
        method: "DELETE",
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        setContacts((prev) => prev.filter((_, i) => i !== index));
        alert(data.message || "Contact deleted successfully");
      } else {
        alert(data.error || "Failed to delete contact.");
      }
    } catch (error) {
      console.error("Delete contact error:", error);
      alert("Server error: Unable to delete contact.");
    }
  };

  return (
    <div className="emergency-page">
      <div className="emergency-card">
        {/* ================= HEADER ================= */}
        <div className="emergency-header">
          <button
            className="back-btn"
            onClick={() =>
              navigate("/profile", {
                state: { from: location.state?.from || "/dashboard" },
              })
            }
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

        {/* ================= Add Contact Button ================= */}
        <button
          className="add-contact-btn"
          onClick={() => {
            if (showForm) {
              setShowForm(false);
              setEditingIndex(null);
              setNewContact({ name: "", number: "" });
            } else {
              setShowForm(true);
            }
          }}
        >
          <FaPlus />
          {showForm ? "Cancel" : "Add New Contact"}
        </button>

        {/* ================= Form ================= */}
        {showForm && (
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
        )}

        {/* ================= Contact List / Empty State ================= */}
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
                key={contact.id || index}
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