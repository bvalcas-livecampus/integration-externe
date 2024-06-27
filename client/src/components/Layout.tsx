import Header from './Header.tsx';
import { Outlet } from 'react-router-dom';
import Footer from "./Footer.tsx";
import {ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

const Layout = () => {
    return (
        <div className="flex flex-col min-h-screen lg:px-6">
            <Header />
            <main className="flex-grow mt-10">
                <ToastContainer/>
                <Outlet />
            </main>
            <Footer />
        </div>
    );
};

export default Layout;
