import { useState } from "react"
import Modal from "../../components/modal.jsx"

// extended modal for add function
function add({ onClose, onAdd }){
    const [amount, setAmount] = useState("");
    const [rawAmount, setRawAmount] = useState("");
    const [notes, setNotes] = useState("");

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
        onAdd(parseFloat(rawAmount), date, notes);
        onClose();
    };

    return (
        <Modal onClose={onClose}>
            <h2>Add Money</h2>
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
                <button type="submit">Confirm</button>
            </form>
        </Modal>
    );
}

export default add;