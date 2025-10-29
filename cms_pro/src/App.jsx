// import { useState } from "react";
// import { useNavigate } from "react-router-dom";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import Signup from "./Component/signup.jsx";
// import Admin from "./Component/adminpage.jsx";
// import Login from "./Component/Login.jsx";
// import  Frontpage from "./Component/frontpage.jsx"; 
// import Events from "./Component/event.jsx";
// import Memberapprove from "./Component/memapprove.jsx";
// import UserDetail from "./Component/userdetail.jsx";
// import EventView from "./Component/viewevent.jsx";
// import Userdashboard from "./Component/userdashboard.jsx";

// import "./App.css";
// import "./login.css";
// import "./sign.css";
// import "./event.css";
// function App() {
//   return (
//     <>
//     <title>Community Management System</title>
//       <Router>
//         <Routes>
//           <Route path="/" element={<Frontpage />}></Route>
//           <Route path="/Login" element={<Login />}></Route>
//           <Route path="/signup" element={<Signup />} />
//           <Route path="/admin" element={<Admin />} />
//           <Route path="/user/:id" element={<UserDetail />} />
//           <Route path="/memapprove" element={<Memberapprove />} />
          
//           <Route path="/events" element={<Events />} />
//           <Route path="/viewevents" element={<EventView />} />
//           <Route path="/userdashboard" element={<Userdashboard />} />

//         </Routes>
//       </Router>
  
//     </>
//   );
// }
// export default App;



import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Signup from "./Component/signup.jsx";
import Admin from "./Component/adminpage.jsx";
import Login from "./Component/Login.jsx";
import Frontpage from "./Component/frontpage.jsx";
import Events from "./Component/event.jsx";
import Memberapprove from "./Component/memapprove.jsx";
import UserDetail from "./Component/userdetail.jsx";
import EventView from "./Component/viewevent.jsx";
import Userdashboard from "./Component/userdashboard.jsx";
import ViewProfile from "./Component/viewprofile.jsx";
import EventPostUser from "./Component/userevent.jsx";
import EventEdit from "./Component/EventEdit1.jsx"; // 👈 New Import
import LostAndFoundApp from "./Component/LostAndFoundApp.jsx"; // Lost and Found Import
import SecurityDashboard from "./Component/securitydashboard.jsx"; // Security Dashboard Import
import PostAnnouncement from "./Component/PostAnnouncement.jsx"; // Post Announcement Import
import ViewAnnouncements from "./Component/ViewAnnouncements.jsx"; // View Announcements Import
import AdminViewDashboard from "./Component/AdminViewDashboard.jsx"; // Admin Dashboard Import
import ViewLostItem from "./Component/viewlostitem.jsx"; // View Lost Items Import
import PastEvents from "./Component/PastEvents.jsx"; // Past Events Import
import { AuthProvider } from "./Component/AuthContext.jsx";
import ProtectedRoute from "./Component/ProtectedRoute.jsx";

import "./App.css";
import "./login.css";
import "./sign.css";
import "./event.css";

function App() {
  return (
    <>
      <title>Community Management System</title>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Frontpage />} />
            <Route path="/Login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
            <Route path="/user/:id" element={<ProtectedRoute><UserDetail /></ProtectedRoute>} />
            <Route path="/memapprove" element={<ProtectedRoute><Memberapprove /></ProtectedRoute>} />
            <Route path="/events" element={<ProtectedRoute><Events /></ProtectedRoute>} />
            <Route path="/viewevents" element={<ProtectedRoute><EventView /></ProtectedRoute>} />
            <Route path="/userdashboard" element={<ProtectedRoute><Userdashboard /></ProtectedRoute>} />
            <Route path="/viewprofile" element={<ProtectedRoute><ViewProfile/></ProtectedRoute>}/>
            <Route path="/userevent" element={<ProtectedRoute><EventPostUser/></ProtectedRoute>}/>
              {/* New Route for Event Editing */}
            <Route path="/events/edit/:id" element={<ProtectedRoute><EventEdit /></ProtectedRoute>} />
            {/* Lost and Found Route */}
            <Route path="/lostandfound" element={<ProtectedRoute><LostAndFoundApp /></ProtectedRoute>} />
            {/* Security Dashboard Route */}
            <Route path="/securitydashboard" element={<ProtectedRoute><SecurityDashboard /></ProtectedRoute>} />
            {/* Post Announcement Route */}
            <Route path="/post-announcement" element={<ProtectedRoute><PostAnnouncement /></ProtectedRoute>} />
            {/* View Announcements Route */}
            <Route path="/view-announcements" element={<ProtectedRoute><ViewAnnouncements /></ProtectedRoute>} />
            {/* Admin Dashboard Route */}
            <Route path="/admin-dashboard" element={<ProtectedRoute><AdminViewDashboard /></ProtectedRoute>} />
            {/* View Lost Items Route */}
            <Route path="/viewlostitems" element={<ProtectedRoute><ViewLostItem /></ProtectedRoute>} />
            {/* View Past Events Route */}
            <Route path="/past-events" element={<ProtectedRoute><PastEvents /></ProtectedRoute>} />
          </Routes>
        </Router>
      </AuthProvider>
    </>
  );
}

export default App;
