'use client'

import React from "react";
import Icon from "../images/index";

const apps = [
    { url: "https://discord.gg/xh8vR6JVzM", name: "Discord" },
    { url: "https://x.com/PrismaXai", name: "Twitter" },
    { url: "https://t.me/PrismaX_News", name: "Telegram" },
];

export default function Third() {

    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(()=>{
        setIsMobile(window.innerWidth < 768);
    }, []);

    return (
        <div style={{
            width: '100vw', height: '60vw', minHeight:'260pt', display: 'flex',
            justifyContent: 'center', alignItems: 'center',
            flexDirection: 'row',
        }}>
            <div style={{
                width: '50%', textAlign: 'center',
                display: 'flex', flexDirection: 'column', justifyContent: 'space-around'
            }}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center' }}>
                    <h1 style={{ fontSize: '6vw', maxWidth: '40vw' }}
                    >Let's Stay Connected</h1>
                </div>
                <br />
                <br />
                <br />
                <div style={{ display: 'flex', flexDirection: (isMobile ? 'column' : 'row'), justifyContent: 'center', gap: '16pt' }}>
                    {apps.map((item, index) => {
                        return (
                            <div
                                key={`app_${index}`}
                                className="sociallink"
                            >
                                <div
                                    onClick={() => item.url && window.open(item.url, "_blank")}
                                    style={{
                                        display: 'flex', flexDirection: 'row', justifyContent: 'center',
                                        gap: '8pt',
                                        fontSize: '16pt',
                                        height: '16pt',
                                        cursor: 'pointer',
                                        color: 'rgba(255, 255, 255, 0.7)',
                                    }}
                                >
                                    <Icon
                                        name={item.name}
                                        height={20}
                                        width={20}
                                    />
                                    {item.name}
                                    <div>
                                        <Icon
                                            name={"IconArrow"}
                                            className="sociallinkarrow"
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <div style={{ width: '50%', textAlign: 'center' }}>
                <img src='/stayConnected.png' alt='stay connected'
                    style={{ width: '100%', height: '100%' }}
                />
            </div>
        </div>
    )
}