import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import LostAndFound from './pages/LostAndFound';
import ReportLost from './pages/ReportLost';
import ReportFound from './pages/ReportFound';
import TrackReport from './pages/TrackReport';
import StudentHelp from './pages/StudentHelp';
import Books from './pages/Books';
import PostBook from './pages/PostBook';
import RentBook from './pages/RentBook';
import MyRentals from './pages/MyRentals';
import Notes from './pages/Notes';
import PostNote from './pages/PostNote';
import NoteDetail from './pages/NoteDetail';
import MyNotes from './pages/MyNotes';
import Profile from './pages/Profile';
import Notifications from './pages/Notifications';
import './styles/Style.css';

function App() {
    return (
        <Router>
            <div className="App" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <main style={{ flex: '1 0 auto' }}>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/lost-found" element={<LostAndFound />} />
                        <Route path="/report-lost" element={<ReportLost />} />
                        <Route path="/report-found" element={<ReportFound />} />
                        <Route path="/track" element={<TrackReport />} />
                        <Route path="/student-help" element={<StudentHelp />} />
                        <Route path="/books" element={<Books />} />
                        <Route path="/post-book" element={<PostBook />} />
                        <Route path="/book/:id/rent" element={<RentBook />} />
                        <Route path="/my-rentals" element={<MyRentals />} />
                        <Route path="/notes" element={<Notes />} />
                        <Route path="/post-note" element={<PostNote />} />
                        <Route path="/note/:id" element={<NoteDetail />} />
                        <Route path="/my-notes" element={<MyNotes />} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="/notifications" element={<Notifications />} />
                    </Routes>
                </main>
                <Footer />
                <ScrollToTop />
            </div>
        </Router>
    );
}

export default App;
