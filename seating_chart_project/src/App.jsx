import { useState, useEffect } from "react";

export default function SeatingChart() {
  const rows = 6;
  const colsPerSide = 3;
  const totalSeats = rows * colsPerSide * 2;

  const [seats, setSeats] = useState(() => {
    const saved = localStorage.getItem("seatingChart");
    return saved ? JSON.parse(saved) : Array(totalSeats).fill({ name: "", reserved: false });
  });

  const [myName, setMyName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminTarget, setAdminTarget] = useState(null);

  const isAdmin = myName === "123";

  useEffect(() => {
    localStorage.setItem("seatingChart", JSON.stringify(seats));
  }, [seats]);

  const handleAdminAssign = () => {
    if (adminTarget === null || !adminInput.trim()) return;
    const updated = [...seats];
    updated[adminTarget] = { name: adminInput.trim(), reserved: true };
    setSeats(updated);
    setAdminTarget(null);
    setAdminInput("");
  };

  const handleReserve = (index) => {
    if (!myName) return;
    const updated = [...seats];
    const currentSeat = seats[index];

    if (isAdmin) {
      setAdminTarget(index);
      setAdminInput(seats[index].name || "");
    } else {
      if (currentSeat.reserved && currentSeat.name === myName) {
        updated[index] = { name: "", reserved: false };
      } else if (!currentSeat.reserved) {
        const previousIndex = seats.findIndex(seat => seat.name === myName);
        if (previousIndex !== -1) {
          updated[previousIndex] = { name: "", reserved: false };
        }
        updated[index] = { name: myName, reserved: true };
      }
      setSeats(updated);
    }
  };

  const handleUnreserve = (index) => {
    if (!isAdmin) return;
    const updated = [...seats];
    updated[index] = { name: "", reserved: false };
    setSeats(updated);
  };

  const getSeatDisplay = (seat, index) => {
    const isMySeat = seat.name === myName;

    if (seat.reserved) {
      if (isMySeat && !isAdmin) {
        return <span className="text-blue-600 font-semibold">我</span>;
      }
      if (isAdmin) {
        return (
          <div className="flex flex-col items-center">
            <span className="text-green-600 text-xs">{seat.name}</span>
            <button onClick={() => handleReserve(index)} className="text-xs mt-1 text-blue-600">指定</button>
            <button onClick={() => handleUnreserve(index)} className="text-red-600 text-xs mt-1">取消</button>
          </div>
        );
      }
      return <span className="text-green-600">✔</span>;
    }

    return isAdmin ? (
      <button onClick={() => handleReserve(index)} className="text-sm text-blue-600">指定</button>
    ) : (
      <button onClick={() => handleReserve(index)} className="text-sm text-gray-500">劃位</button>
    );
  };

  const renderSeatRow = (rowIndex) => {
    const startLeft = rowIndex * colsPerSide * 2;
    const startRight = startLeft + colsPerSide;

    return (
      <div key={rowIndex} className="flex items-center space-x-4">
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: colsPerSide }).map((_, colIndex) => {
            const idx = startLeft + colIndex;
            const seat = seats[idx];
            return (
              <div
                key={colIndex}
                className={`border p-2 w-20 h-16 text-center flex items-center justify-center ${seat.reserved ? (seat.name === myName && !isAdmin ? 'bg-blue-100' : 'bg-green-200') : 'bg-white'}`}
              >
                {getSeatDisplay(seat, idx)}
              </div>
            );
          })}
        </div>
        <div className="w-16 text-center font-semibold">走道</div>
        <div className="grid grid-cols-3 gap-2">
          {Array.from({ length: colsPerSide }).map((_, colIndex) => {
            const idx = startRight + colIndex;
            const seat = seats[idx];
            return (
              <div
                key={colIndex}
                className={`border p-2 w-20 h-16 text-center flex items-center justify-center ${seat.reserved ? (seat.name === myName && !isAdmin ? 'bg-blue-100' : 'bg-green-200') : 'bg-white'}`}
              >
                {getSeatDisplay(seat, idx)}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return !isLoggedIn ? (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-4">請先輸入您的名字</h1>
      <input
        type="text"
        placeholder="輸入名字"
        value={myName}
        onChange={(e) => setMyName(e.target.value)}
        className="border p-2 w-64 text-center"
      />
      <div className="mt-4">
        <button
          onClick={() => myName && setIsLoggedIn(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          確認
        </button>
      </div>
    </div>
  ) : (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-center mb-4">教室座位表</h1>
      <div className="text-center mb-2 font-semibold">黑板</div>
      <div className="text-center mb-4 text-gray-500">登入身份：{isAdmin ? '管理員' : '學生'}（{myName}）</div>
      {isAdmin && adminTarget !== null && (
        <div className="flex items-center justify-center mb-4 space-x-2">
          <input
            type="text"
            placeholder="輸入學生姓名"
            value={adminInput}
            onChange={(e) => setAdminInput(e.target.value)}
            className="border p-2 text-center"
          />
          <button
            onClick={handleAdminAssign}
            className="bg-green-500 text-white px-3 py-2 rounded"
          >
            確認指定
          </button>
          <button
            onClick={() => { setAdminTarget(null); setAdminInput(""); }}
            className="bg-gray-400 text-white px-3 py-2 rounded"
          >
            取消
          </button>
        </div>
      )}
      <div className="flex flex-col items-center space-y-2">
        {Array.from({ length: rows }).map((_, rowIndex) => renderSeatRow(rowIndex))}
      </div>
    </div>
  );
}