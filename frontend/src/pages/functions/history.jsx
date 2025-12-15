import { useState, useEffect } from "react"
import Modal from "../../components/modal.jsx"

function history({ onClose, transactions }) {
    const [selectedTx, setSelectedTx] = useState(null);
    
    // sort transactions by date, latest first
    const sortedTransactions = [...transactions].sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
    });

    return (
        <Modal onClose={onClose}>
            <h2>Transaction History</h2>

            <div 
                className="history-list"
                onWheel={(e) => e.stopPropagation()}
            >
                {sortedTransactions.length === 0 && <p>No transactions yet...</p>}

                {sortedTransactions.map((t, index) => {
                    if (!t || typeof t !== "object") return null;

                    return (
                        <div
                            key={t._id || t.id || index}
                            className="transaction-box"
                            onClick={() => setSelectedTx(t)}
                        >
                            <div className="transaction-summary">
                                <span className="amount-sign">
                                    <strong className={t.type === "add" ? "add-sign" : "subtract-sign"}>
                                        {t.type === "add" ? "+" : "-"}
                                    </strong>
                                    <strong> ₱{t.amount}</strong>
                                </span>
                                <span className="transaction-date">{t.date}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {selectedTx && (
                <Modal onClose={() => setSelectedTx(null)}>
                    <h3>Transaction Details</h3>
                    <div className="transaction-detail">
                        <p>
                            <strong>Type:</strong> {selectedTx.type === "add" ? "Added" : "Spent"}
                        </p>
                        <p>
                            <strong>Amount:</strong> ₱{selectedTx.amount}
                        </p>
                        <p>
                            <strong>Date:</strong> {selectedTx.date}
                        </p>
                        {selectedTx.notes && (
                            <p>
                                <strong>Notes:</strong> {selectedTx.notes}
                            </p>
                        )}
                        {selectedTx.type === "subtract" && (
                            <p>
                                <strong>Worth it?</strong> {selectedTx.worthIt ? "Yes" : "No"}
                            </p>
                        )}
                    </div>
                </Modal>
            )}
        </Modal>
    );
}

export default history;