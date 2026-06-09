/**
 * GoldFireDragon Browser - Japan OpenVPN Core Control Script
 * 리포지토리 내의 실제 일본 .ovpn 파일 내용을 직접 읽어와서 백엔드로 전송합니다.
 */
document.addEventListener('DOMContentLoaded', () => {
    const vpnWidget = document.getElementById('vpn-floating-widget');
    const vpnBtn = document.getElementById('vpn-master-btn');
    const vpnSelector = document.getElementById('vpn-server-selector');

    if (!vpnWidget || !vpnBtn || !vpnSelector) {
        console.warn("[VPN 알림] 화면에서 요소를 찾을 수 없어 대기합니다.");
        return;
    }

    let isVpnActive = true; // 초기값: 연결됨

    vpnBtn.addEventListener('click', async (event) => {
        event.stopPropagation();
        const selectedConfigName = vpnSelector.value;

        // ⚠️ 저장소 내부 구조에 명시된 일본 .ovpn 파일 상대 경로 매핑
        const ovpnFileUrl = `OpenVpn/Server/Japan/Configs/${selectedConfigName}`;

        if (isVpnActive) {
            // 🛑 [VPN 연결 해제 / OFF 프로시저]
            isVpnActive = false;
            vpnBtn.innerText = "연결하기";
            vpnBtn.style.setProperty("background-color", "#dc2626", "important");
            vpnWidget.style.setProperty("border-color", "rgba(168, 85, 247, 0.6)", "important");

            // Express 백엔드 서버에 실제 프로세스 종료 신호 전달
            await fetch("/api/vpn/disconnect", { 
                method: "POST",
                headers: { "Content-Type": "application/json" }
            }).catch((err) => console.error("Express 통신 실패:", err));

        } else {
            // 🍏 [VPN 새롭게 연결 / ON 프로시저]
            isVpnActive = true;
            vpnBtn.innerText = "연결됨";
            vpnBtn.style.setProperty("background-color", "#059669", "important");
            vpnWidget.style.setProperty("border-color", "#10b981", "important");

            try {
                // 3. 자바스크립트 브라우저 엔진이 .ovpn 설정 파일의 실제 텍스트 문자열을 긁어옴
                const response = await fetch(ovpnFileUrl);
                if (!response.ok) throw new Error(".ovpn 파일 읽기 실패");
                const ovpnFileContent = await response.text();

                // 4. 읽어온 .ovpn 텍스트 원본을 Express 백엔드 API로 다이렉트 전송
                await fetch("/api/vpn/connect-japan", {
                    method: "POST",
                    headers: { "Content-Type", "application/json" },
                    body: JSON.stringify({ 
                        vpnFileName: selectedConfigName,
                        vpnConfigData: ovpnFileContent // 파일 내용 직접 주입
                    })
                });
                console.log(`[VPN] 일본 서버 [${selectedConfigName}] 내용 백엔드 전달 완료.`);
            } catch (err) {
                console.error("[VPN 시스템 에러]:", err);
            }
        }
    });
});
