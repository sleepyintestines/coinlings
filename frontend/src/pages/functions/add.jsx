import { useState, useEffect } from "react"
import Modal from "../../components/modal.jsx"
import { apiFetch } from "../../fetch.js"

// extended modal for add function
function add({ onClose, onAdd }){
    const [amount, setAmount] = useState("");
    const [rawAmount, setRawAmount] = useState("");
    const [notes, setNotes] = useState("");
    const [category, setCategory] = useState("");
    const [categories, setCategories] = useState({ default: [], custom: [] });
    const [showCustomInput, setShowCustomInput] = useState(false);
    const [customCategory, setCustomCategory] = useState("");

    // automatically add date of transaction
    const [date, setDate] = useState(() => {
        const today = new Date();
        return today.toISOString().split("T")[0];
    });

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const token = localStorage.getItem("token");
                const data = await apiFetch("/transactions/categories?type=add", { token });
                setCategories(data);
                
                // set last used category as default
                const lastCategory = localStorage.getItem("lastAddCategory");
                if (lastCategory) {
                    setCategory(lastCategory);
                }
            } catch (err) {
                console.error("Failed to fetch categories:", err);
            }
        };
        fetchCategories();
    }, []);

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

    const handleCategoryChange = (e) => {
        const value = e.target.value;
        if (value === "custom") {
            setShowCustomInput(true);
            setCategory("");
        } else {
            setShowCustomInput(false);
            setCategory(value);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const finalCategory = showCustomInput ? customCategory : category;
        
        // save last used category
        if (finalCategory) {
            localStorage.setItem("lastAddCategory", finalCategory);
        }
        
        onAdd(parseFloat(rawAmount), date, notes, finalCategory);
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
                <label>
                    Category
                    <select
                        value={showCustomInput ? "custom" : category}
                        onChange={handleCategoryChange}
                    >
                        <option value="">-- Select Category --</option>
                        <optgroup label="Default Categories">
                            {categories.default.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </optgroup>
                        {categories.custom.length > 0 && (
                            <optgroup label="Your Categories">
                                {categories.custom.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </optgroup>
                        )}
                        <option value="custom">+ Add Custom Category</option>
                    </select>
                </label>
                {showCustomInput && (
                    <input
                        type="text"
                        placeholder="Enter custom category"
                        value={customCategory}
                        onChange={(e) => setCustomCategory(e.target.value)}
                        required
                    />
                )}
                <button type="submit">Confirm</button>
            </form>
        </Modal>
    );
}

export default add;