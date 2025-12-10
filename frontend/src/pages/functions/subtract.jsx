import { useState } from "react"
import Modal from "../../components/modal.jsx"

// extended modal for add function
function subtract({ onClose, onSubtract, balance }){
    const [amount, setAmount] = useState("");
    const [rawAmount, setRawAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [worthIt, setWorthIt] = useState("yes");
    const [error, setError] = useState("");

    // automatically add date of transaction
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    // automatically add "," for number inputs
    const handleAmountChange = (e) => {
        // remove any commas inputted
        const value = e.target.value.replace(/,/g, "");
        // checks if input is valid number
        if(!isNaN(value)){
            setRawAmount(value);
            // add ","
            const formatted = Number(value).toLocaleString();
            setAmount(formatted);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // handles insufficient funds
        if(Number(rawAmount) > balance){
            setError("Insufficient balance!");
            return;
        }

        onSubtract(parseFloat(rawAmount), date, notes, worthIt === "yes");
        onClose();
    };

    return (
        <Modal onClose={() => { setError(""); onClose(); }}>
            <h2>Subtract Money</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Amount"
                    value={amount}
                    onChange={handleAmountChange}
                    required
                />
                <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                />
                <textarea
                    placeholder="Write something here..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                />
                <label>
                    Was it worth it?
                    <select
                        value={worthIt}
                        onChange={(e) => setWorthIt(e.target.value)}
                        required
                    >
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                    </select>
                </label>
                <button type="submit">Confirm</button>
                {error && <p style={{ color: "red" }}>{error}</p>}
            </form>
        </Modal>
    );
}

export default subtract;