
import { useState, useEffect } from "react";
import { ref, set, onValue } from "firebase/database";
import { db } from "./firebase-config";

export default function RealtimeSeatingChart() {
  const rows = 6;
  const colsPerSide = 3;
  const totalSeats = rows * colsPerSide * 2;
  const [seats, setSeats] = useState(Array(totalSeats).fill({ name: "", reserved: false }));
  const [myName, setMyName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [adminInput, setAdminInput] = useState("");
  const [adminTarget, setAdminTarget] = useState(null);
  const isAdmin = myName === "123";

  useEffect(() => {
    const seatsRef = ref(db, "seats");
    const unsubscribe = onValue(seatsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) setSeats(data);
    });
    return () => unsubscribe();
  }, []);

  const updateSeat = (index, newSeat) => {
    const updatedSeats = [...seats];
    updatedSeats[index] = newSeat;
    set(ref(db, "seats"), updatedSeats);
  };

  const handleAdminAssign = () => {
    if (adminTarget === null || !adminInput.trim()) return;
    updateSeat(adminTarget, { name: adminInput.trim(), reserved: true });
    setAdminTarget(null);
    setAdminInput("");
  };

  const handleReserve = (index) => {
    if (!myName) return;
    const currentSeat = seats[index];

    if (isAdmin) {
      setAdminTarget(index);
      setAdminInput(seats[index].name || "");
    } else {
      const previousIndex = seats.findIndex(seat => seat.name === myName);
      const updated = [...seats];

      if (currentSeat.reserved && currentSeat.name === myName) {
        updated[index] = { name: "", reserved: false };
      } else if (!currentSeat.reserved) {
        if (previousIndex !== -1) {
          updated[previousIndex] = { name: "", reserved: false };
        }
        updated[index] = { name: myName, reserved: true };
      }
      set(ref(db, "seats"), updated);
    }
  };

  const handleUnreserve = (index) => {
    if (!isAdmin) return;
    updateSeat(index, { name: "", reserved: false });
  };

  const getSeatDisplay = (seat, index) => {
    const isMySeat = seat.name === myName;

    if (seat.reserved) {
      if (isMySeat && !isAdmin) return <span className="text-blue-600 font-semibold">我</span>;
      if (isAdmin) {
        return (
          <div className="flex flex-col items-center">
            <span className="text-green-600 text-xs break-words max-w-full">{seat.name}</span>
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
      <div key={rowIndex} className="grid grid-cols-7 gap-1 w-full max-w-md mx-auto mb-2">
        {Array.from({ length: colsPerSide }).map((_, colIndex) => {
          const idx = startLeft + colIndex;
          const seat = seats[idx];
          return (
            <div
              key={colIndex}
              className={`border p-1 aspect-square flex items-center justify-center ${seat.reserved ? (seat.name === myName && !isAdmin ? 'bg-blue-100' : 'bg-green-200') : 'bg-white'} text-xs`}
            >
              {getSeatDisplay(seat, idx)}
            </div>
          );
        })}
        <div className="flex items-center justify-center font-semibold">走道</div>
        {Array.from({ length: colsPerSide }).map((_, colIndex) => {
          const idx = startRight + colIndex;
          const seat = seats[idx];
          return (
            <div
              key={colIndex}
              className={`border p-1 aspect-square flex items-center justify-center ${seat.reserved ? (seat.name === myName && !isAdmin ? 'bg-blue-100' : 'bg-green-200') : 'bg-white'} text-xs`}
            >
              {getSeatDisplay(seat, idx)}
            </div>
          );
        })}
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
    <div className="p-2 sm:p-4">
      <h1 className="text-2xl font-bold text-center mb-4">教室座位表（Firebase即時同步）</h1>
      <div className="text-center mb-2 font-semibold">黑板</div>
      <div className="text-center mb-4 text-gray-500">登入身份：{isAdmin ? '管理員' : '學生'}（{myName}）</div>
      {isAdmin && adminTarget !== null && (
        <div className="flex flex-wrap justify-center items-center mb-4 gap-2">
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
      <div className="flex flex-col items-center gap-3 w-full">
        {Array.from({ length: rows }).map((_, rowIndex) => renderSeatRow(rowIndex))}
      </div>
    </div>
  );
}
