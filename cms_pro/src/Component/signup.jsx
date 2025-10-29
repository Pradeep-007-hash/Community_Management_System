import {useState} from "react";
import { useNavigate } from "react-router-dom";

function signuppage(){
    const [formData, setFormData] = useState({
    firstname: "",
    lastname:"",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    floor_no: "",
    door_no: "",
    role: "",
    family_details:"",
    family_members: 1,
    communication: "",
    photo: null,
    terms: false,
    worker_type: "",
    work: "",
    time: "",
    family_member:[{
      name:"",age:"",gender:"",occupation:"",student_school:"",student_college:"",office_name:"",student_school_name:"",student_college_name:"",
      
    }],
    seperate_work: "",  
  });

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    if (type === "checkbox") {
      setFormData({ ...formData, [name]: checked });
    } else if (type === "file") {
      setFormData({ ...formData, [name]: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

 const getDoorOptions = (floorNo) => {
  if (!floorNo) return [];

  const prefixes = {
    1: "f",
    2: "s",
    3: "t",
    4: "fo",
    5: "fi"
  };

  const prefix = prefixes[floorNo];
  const doors = [];

  for (let i = 1; i <= 10; i++) {
    doors.push(`${prefix}${i}`);
  }

  return doors;
};


  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if(formData.password !== formData.confirm_password) {
    alert("Passwords do not match!");
    return;
  }

  if(!/^\d{10}$/.test(formData.phone)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
  }

  try {
    const res = await fetch("http://localhost:5000/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });

    const msg = await res.text();
    alert(msg);
  } catch (err) {
    console.error(err);
    alert("Signup failed");
  }
};

<h1 style={{textAlign:"center",color:"black"}}>signupPage</h1>
  return (
    <div className="container"style={{background:"lightblue"}}>
      <h2>Welcome You  </h2>
      <h2>Community Sign Up</h2>
      <form onSubmit={handleSubmit}>
         <label>Role in Community</label>
        <select
          name="role"style={{background:"white",color:"black"}}
          value={formData.role}
          onChange={handleChange}
        >
          <option value="">-- Select Role --</option>
          <option value="admin">Admin</option>
          <option value="member">Member</option>
          <option value="worker">Worker</option>
        </select>
        <label>First Name*</label>
        <input
          type="text"style={{background:"white",color:"black"}}
          name="firstname"
          value={formData.firstname}
          onChange={handleChange}
          placeholder="Enter your first name"
          required
        />
        <label>last Name</label>
        <input 
        type="text" style={{background:"white",color:"black"}}
        name="lastname"
        placeholder="Enter your last name(optional)" 
        value={formData.lastname} 
        onChange={handleChange} />
        <label>Username*</label>
        <input
          type="text"style={{background:"white",color:"black"}}
          name="username"
          value={formData.username}
          onChange={handleChange}
          placeholder="Choose a unique username"
          required
        />

        <label>Email Address*</label>
        <input
          type="email"style={{background:"white",color:"black"}}
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter a valid email address"
          required
        />

        <label>Phone Number*</label>
        <input
          type="tel"style={{background:"white",color:"black"}}
          name="phone"
          value={formData.phone}
          placeholder="Enter a valid 10-digit phone number"
          onChange={handleChange} required
        />

        <label>Password*</label>
        <input
          type="password"style={{background:"white",color:"black"}}
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Create a strong password"
          required
        />

        <label>Confirm Password*</label>
        <input
          type="password"style={{background:"white",color:"black"}}
          name="confirm_password"
          value={formData.confirm_password}
          onChange={handleChange}
          placeholder="Enter the Same Password"
          required
        />
        

       
        {/*For Family role*/}
        {formData.role.toLowerCase()=="member" && (
          <>
          <label>Floor Number</label>
        <select
          style={{background:"white",color:"black"}}
          name="floor_no"
          value={formData.floor_no}
          onChange={handleChange}>
          <option value="">-- Select Floor Number --</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>

          <label>Door No</label>
        <select
          style={{ background: "white", color: "black" }}
          name="door_no"
          value={formData.door_no}
          onChange={handleChange}
          required
        >
          <option value="">-- Select Door No --</option>
          {getDoorOptions(formData.floor_no).map((door, index) => (
            <option key={index} value={door}>
              {door}
            </option>
          ))}
        </select>




        <label>Flat / Apartment Name</label>
        <input
          type="text"style={{background:"white",color:"black"}}
          name="apartment"
          value={formData.apartment}
          onChange={handleChange}
        />
          <label> Single/Married
            <select
            name="family_details" style={{background:"white",color:"black"}}
            value={formData.family_details}
            onChange={handleChange }
            >
            <option value="">-- Select Family Details --</option>
            <option value="single">Single</option>
            <option value="married">Married</option>
            </select>
          </label>
          {formData.family_details.toLowerCase() === "married" && (
              <label>Number of Family members
                <input
                type="number" style={{background:"white",color:"black"}}
                name="family_members"
                value={formData.family_members}
                onChange={handleChange}
                min={1}
                max={25}
                />
                {/*Getting Family Members Dynamically*/}
                {[...Array(Number(formData.family_members))].map((_, index) => (
            <div key={index} style={{marginBottom:"10px"}}>
              <label>Family Member {index + 1} Name</label>
              <input
                type="text" style={{background:"white",color:"black"}}
                name={`family_member_${index + 1}`}
                value={formData[`family_member_${index + 1}`] || ""}    
                onChange={handleChange}
                placeholder={`Enter name of family member ${index + 1}`}
                required
              />
              <input
                type="text" style={{background:"white",color:"black"}}
                name={`family_member_${index + 1}age`}
                value={formData[`family_member_${index + 1}age`] || ""}
                onChange={handleChange}
                placeholder={`Enter age of  ${index + 1}`}
                required
              />
              <select
                name={`family_member_${index + 1}gender`} style={{background:"white",color:"black"}}
                value={formData[`family_member_${index + 1}gender`] || ""}
                onChange={handleChange}
                required
                >
                  <option value={""}>---select Gender---</option>
                  <option value={"male"}>Male</option>
                  <option value={"female"}>Female</option>
                </select>
                <select
                name={`family_member_${index + 1}occupation`} style={{background:"white",color:"black"}}
                value={formData[`family_member_${index + 1}occupation`] || ""}
                onChange={handleChange}
                required
                >
                  <option value={""}>---select Occupation---</option>
                  <option value={"student"}>Student</option>
                  <option value={"working"}>Working</option>
                  <option value={"homemaker"}>Homemaker</option>
                  <option value={"retired"}>Retired</option>
                </select>
                {formData[`family_member_${index + 1}occupation`] === "student" && (
                  <>
                  <label>
                    School/College
                    <select
                      name={`family_member_${index + 1}student_school`} style={{background:"white",color:"black"}}
                      value={formData[`family_member_${index + 1}student_school`] || ""}
                      onChange={handleChange}
                      required>
                      <option value={""}>---select School/College---</option>
                      <option value={"school"}>School</option>  
                      <option value={"college"}>College</option>
                    </select>
                    {formData[`family_member_${index + 1}student_school`] === "school" && (
                      <input
                        type="text" style={{background:"white",color:"black"}}
                        name={`family_member_${index + 1}student_school_name`}
                        value={formData[`family_member_${index + 1}student_school_name`] || ""}
                        onChange={handleChange}
                        placeholder="Enter School Name"
                        required
                      />
                    )}
                    {formData[`family_member_${index + 1}student_school`] === "college" && (
                      <input
                        type="text" style={{background:"white",color:"black"}}
                        name={`family_member_${index + 1}student_college_name`}
                        value={formData[`family_member_${index + 1}student_college_name`] || ""}
                        onChange={handleChange}
                        placeholder="Enter College Name"    
                        required
                      />
                    )}
                    </label>
                  </>
                )}
                {formData[`family_member_${index + 1}occupation`] === "working" && (
                  <label>
                    Office Name
                    <input
                      type="text" style={{background:"white",color:"black"}}
                      name={`family_member_${index + 1}office_name`}
                      value={formData[`family_member_${index + 1}office_name`] || ""}
                      onChange={handleChange}
                      placeholder="Enter Office Name"
                      required
                    />
                  </label>
                )}

            </div>
          ))}
                </label>
          )}
          
          <label>Preferred Communication Mode</label>
        <select
          name="communication"style={{background:"white",color:"black"}}
          value={formData.communication}
          onChange={handleChange}
        >
          <option value="">-- Select --</option>
          <option value="email">Email</option>
          <option value="sms">SMS</option>
        </select>
          </>
        )}
        {/*For Worker Role*/}
        {formData.role.toLowerCase() === "worker" && (
          <>
            <label>Worker Type
            <select
              name="worker_type" style={{background:"white",color:"black"}}
              value={formData.worker_type}
              onChange={handleChange}
              >
              <option value="">-- Select Worker Type --</option>
              <option value="seperate">Seprate Worker</option>
              <option value="shared">Apartment Worker</option>
              </select>
              </label>
              {formData.worker_type.toLowerCase() === "shared" && (
                <label> Apartment Work
                <input
                  type="text" style={{background:"white",color:"black"}}
                  name="work"
                  value={formData.work}
                  onChange={handleChange}
                  placeholder="Enter your work-Not NULL"
                  required
                  />
                </label>
                )}
              {formData.worker_type.toLowerCase() === "seperate" && (
                <label>
                seperate Work
                <input
                  type="text" style={{background:"white",color:"black"}}
                  name="door_no"
                  value={formData.seperate_work}
                  onChange={handleChange}
                  placeholder="Door number of Working house"
                  required
                  />
                  Enter the Work
                  <input
                  type="text" style={{background:"white",color:"black"}}
                  name="work"
                  value={formData.work}
                  onChange={handleChange}
                  placeholder="Enter your work-Not NULL"
                  required
                  />
                </label>
                )}
                <label>Working Time*</label>
                <input
                  type="text" style={{background:"white",color:"black"}}
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  placeholder="Enter your working time"
                  required
                />
              
          </>
          )}


        <label>Profile Photo</label>
        <input
          type="file" style={{color:"black"}}
          name="photo"
          onChange={handleChange}
        />

        <div className="checkbox" style={{color:"black"}}>
          <input
            type="checkbox"
            name="terms"
            checked={formData.terms}
            onChange={handleChange}
            required
          />I agree to the Community Rules & Privacy Policy
          
        </div>

        <button type="submit" style={{background:"grey"}}>Register</button>
      </form>
      <a className="join-link" href="/login" style={{ width:"360px", textAlign:"center", marginTop:"10px", background:"grey"}}>
            Login
      </a>

    </div> 
  );
}
export default signuppage;

