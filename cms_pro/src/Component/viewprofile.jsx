import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const ViewProfile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    username: "",
    email: "",
    phone: "",
    door_no: "",
    floor_no: "",
    apartment: "",
    family_details: "",
    family_members: "",
    communication: "",
    worker_type: "",
    work: "",
    seperate_work: "",
    time: "",
    terms: false,
    status: "",
  });

  // 🔹 Fetch user data on mount
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (!userId) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/user/profile/${userId}`, {
          method: "GET",
          credentials: "include",
        });
        const data = await res.json();
        if (res.ok) {
          // ✅ Fill all fields dynamically
          setFormData({
            firstname: data.firstname || "",
            lastname: data.lastname || "",
            username: data.username || "",
            email: data.email || "",
            phone: data.phone || "",
            door_no: data.door_no || "",
            floor_no: data.floor_no || "",
            apartment: data.apartment || "",
            family_details: data.family_details || "",
            family_members: data.family_members || [],
            communication: data.communication || "",
            worker_type: data.worker_type || "",
            work: data.work || "",
            seperate_work: data.seperate_work || "",
            time: data.time || "",
            terms: data.terms || false,
            status: data.status || "",
          });
        } else {
          alert(data.error || "Failed to fetch user");
        }
      } catch (err) {
        console.error(err);
        alert("Server error. Try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  // 🔹 Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // 🔹 Save changes
  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");

    // Keep family_members as array
    const updatedData = {
      ...formData,
    };

    try {
      const res = await fetch(`http://localhost:5000/user/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
        credentials: "include",
      });

      const data = await res.json();
      if (res.ok) {
        alert("✅ Profile updated successfully!");
        // No need to change family_members back to string
      } else {
        alert(data.error || "Failed to update profile");
      }
    } catch (err) {
      console.error(err);
      alert("Server error. Try again later.");
    }
  };

  if (loading) return <p className="text-center text-lg mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <button onClick={() => navigate(-1)} className="mb-4 bg-gray-300 px-3 py-1 rounded" style={{backgroundColor:"grey"}}>
        Back
      </button>
      
      <main className="mt-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-6"style={{color:"black"}} >Your Profile</h1>

        <form className="bg-white p-6 rounded-lg shadow-md max-w-2xl" onSubmit={handleSubmit}>
          {Object.keys(formData).map((key) => (
            <div className="mb-4" key={key}>
              <label className="block text-gray-700 mb-1 capitalize">
                {key.replace("_", " ")}
              </label>
              {key === "terms" ? (
                <input
                  type="checkbox"
                  name={key}
                  checked={formData[key]}
                  onChange={handleChange}
                  className="h-4 w-4"
                  style={{color:"black",backgroundColor:"white"}}
                />
              ) : key === "family_members" ? (
                <div className="w-full border border-gray-300 rounded px-3 py-2 bg-gray-50">
                  {Array.isArray(formData[key]) && formData[key].length > 0 ? (
                    <div>
                      <h4 className="font-semibold mb-2">Family Members:</h4>
                      {formData[key].map((member, index) => (
                        <div key={index} className="mb-4 p-2 border rounded bg-white">
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              placeholder="Name"
                              value={member.name || ""}
                              onChange={(e) => {
                                const newMembers = [...formData.family_members];
                                newMembers[index].name = e.target.value;
                                setFormData({ ...formData, family_members: newMembers });
                              }}
                              className="border border-gray-300 rounded px-2 py-1"
                            />
                            <input
                              type="number"
                              placeholder="Age"
                              value={member.age || ""}
                              onChange={(e) => {
                                const newMembers = [...formData.family_members];
                                newMembers[index].age = e.target.value;
                                setFormData({ ...formData, family_members: newMembers });
                              }}
                              className="border border-gray-300 rounded px-2 py-1"
                            />
                            <select
                              value={member.gender || ""}
                              onChange={(e) => {
                                const newMembers = [...formData.family_members];
                                newMembers[index].gender = e.target.value;
                                setFormData({ ...formData, family_members: newMembers });
                              }}
                              className="border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Select Gender</option>
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                            </select>
                            <select
                              value={member.occupation || ""}
                              onChange={(e) => {
                                const newMembers = [...formData.family_members];
                                newMembers[index].occupation = e.target.value;
                                setFormData({ ...formData, family_members: newMembers });
                              }}
                              className="border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="">Select Occupation</option>
                              <option value="student">Student</option>
                              <option value="working">Working</option>
                              <option value="homemaker">Homemaker</option>
                              <option value="retired">Retired</option>
                            </select>
                            {member.occupation === "student" && (
                              <>
                                <select
                                  value={member.student_school || ""}
                                  onChange={(e) => {
                                    const newMembers = [...formData.family_members];
                                    newMembers[index].student_school = e.target.value;
                                    setFormData({ ...formData, family_members: newMembers });
                                  }}
                                  className="border border-gray-300 rounded px-2 py-1"
                                >
                                  <option value="">School/College</option>
                                  <option value="school">School</option>
                                  <option value="college">College</option>
                                </select>
                                {member.student_school === "school" && (
                                  <input
                                    type="text"
                                    placeholder="School Name"
                                    value={member.student_school_name || ""}
                                    onChange={(e) => {
                                      const newMembers = [...formData.family_members];
                                      newMembers[index].student_school_name = e.target.value;
                                      setFormData({ ...formData, family_members: newMembers });
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1"
                                  />
                                )}
                                {member.student_school === "college" && (
                                  <input
                                    type="text"
                                    placeholder="College Name"
                                    value={member.student_college_name || ""}
                                    onChange={(e) => {
                                      const newMembers = [...formData.family_members];
                                      newMembers[index].student_college_name = e.target.value;
                                      setFormData({ ...formData, family_members: newMembers });
                                    }}
                                    className="border border-gray-300 rounded px-2 py-1"
                                  />
                                )}
                              </>
                            )}
                            {member.occupation === "working" && (
                              <input
                                type="text"
                                placeholder="Office Name"
                                value={member.office_name || ""}
                                onChange={(e) => {
                                  const newMembers = [...formData.family_members];
                                  newMembers[index].office_name = e.target.value;
                                  setFormData({ ...formData, family_members: newMembers });
                                }}
                                className="border border-gray-300 rounded px-2 py-1"
                              />
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const newMembers = formData.family_members.filter((_, i) => i !== index);
                              setFormData({ ...formData, family_members: newMembers });
                            }}
                            className="mt-2 bg-red-500 text-white px-2 py-1 rounded text-sm"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          const newMembers = [...formData.family_members, {
                            name: "",
                            age: "",
                            gender: "",
                            occupation: "",
                            student_school: "",
                            student_school_name: "",
                            student_college_name: "",
                            office_name: ""
                          }];
                          setFormData({ ...formData, family_members: newMembers });
                        }}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Add Family Member
                      </button>
                    </div>
                  ) : (
                    <div>
                      <span className="text-gray-500">No family members added</span>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, family_members: [{
                            name: "",
                            age: "",
                            gender: "",
                            occupation: "",
                            student_school: "",
                            student_school_name: "",
                            student_college_name: "",
                            office_name: ""
                          }] });
                        }}
                        className="ml-2 bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Add Family Member
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  name={key}
                  value={formData[key]}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded px-3 py-2"
                />
              )}
            </div>
          ))}

          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded font-semibold transition"
            style={{backgroundColor:"grey"}}
          >
            Save Changes
          </button>
        </form>
      </main>
    </div>
  );
};

export default ViewProfile;
