import "../css/modal.css"

// base modal 
function modal({ children, onClose }){
    return(
        <div className="modal-overlay">
            <div className="modal-box">
                <button className="close-btn" onClick={onClose}>
                    ✕
                </button>
                {children}
            </div>
        </div>
    );
}

export default modal;