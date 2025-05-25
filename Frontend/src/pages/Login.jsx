import { useEffect } from "react";

function Home() {
    useEffect(() => {
        document.title = "Đăng nhập";
    }, []);

    return (
        <div className="text-center p-4">
            <h1 className="text-3xl font-bold">Đăng nhập</h1>
        </div>
    );
}

export default Home;
