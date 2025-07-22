import ProteinViewer from '../components/ProteinViewer';

export default function Home() {
    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-4xl border border-white">
                <ProteinViewer />
            </div>
        </div>
    )
}   
