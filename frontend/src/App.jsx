import { useEffect, useState } from "react";
import "./App.css";

function AdminDashboard({ username }) {
  const [dashboard, setDashboard] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [date, setDate] = useState("");
  const [baseId, setBaseId] = useState("");
  const [equipmentTypeId, setEquipmentTypeId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const [selectedMovement, setSelectedMovement] = useState(null);

  useEffect(() => {
    const loadFilters = async () => {
      try {
        const [baseResponse, equipmentResponse] = await Promise.all([
          fetch("https://military-asset-management-production-581c.up.railway.app/api/bases/", {
            credentials: "include",
          }),
          fetch("https://military-asset-management-production-581c.up.railway.app/api/equipment/", {
            credentials: "include",
          }),
        ]);

        const baseData = await baseResponse.json();
        const equipmentData = await equipmentResponse.json();

        if (baseResponse.ok) {
          setBases(baseData);
        }

        if (equipmentResponse.ok) {
          setEquipmentTypes(equipmentData);
        }
      } catch (err) {
        setError("Unable to load filters");
      }
    };

    loadFilters();
  }, []);

  
  useEffect(() => {
    const fetchDashboard = async () => {
      setLoading(true);
      setError("");

      try {
        const params = new URLSearchParams();

        if (date) {
          params.append("date", date);
        }

        if (baseId) {
          params.append("base_id", baseId);
        }

        if (equipmentTypeId) {
          params.append("equipment_type_id", equipmentTypeId);
        }

        const url = `https://military-asset-management-production-581c.up.railway.app/api/dashboard/?${params.toString()}`;

        const response = await fetch(url, {
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          setDashboard(data);
        } else {
          setError(data.error || "Failed to load dashboard");
        }
      } catch (err) {
        setError("Unable to connect to server");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [date, baseId, equipmentTypeId]);

  return (
    <div className="dashboard">
     
      <h2>Admin Dashboard</h2>
      <p>Welcome, {username}</p>

      <button
  className="filter-toggle"
  onClick={() => setShowFilters(!showFilters)}
>
⚙ Filters</button>

{showFilters && (
  <div className="filters">
        
        
        <div>
          <label>Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </div>

        <div>
          <label>Base</label>
          <select
            value={baseId}
            onChange={(e) => setBaseId(e.target.value)}
          >
            <option value="">All Bases</option>

            {bases.map((base) => (
              <option key={base.id} value={base.id}>
                {base.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Equipment Type</label>
          <select
            value={equipmentTypeId}
            onChange={(e) => setEquipmentTypeId(e.target.value)}
          >
            <option value="">All Equipment</option>

            {equipmentTypes.map((equipment) => (
              <option key={equipment.id} value={equipment.id}>
                {equipment.name}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={() => {
            setDate("");
            setBaseId("");
            setEquipmentTypeId("");
          }}
        >
          Clear Filters
        </button>
      </div>
      )}

      {loading && <p>Loading dashboard...</p>}

      {error && <p>{error}</p>}

      {!loading && !error && (
        <div className="dashboard-card">
          <h3>Dashboard</h3>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Base</th>
                <th>Equipment Type</th>
                <th>Opening Balance</th>
                <th>Closing Balance</th>
                <th>Net Movement<br /><small>(Click for details)</small></th>
                <th>Assigned</th>
                <th>Expended</th>
              </tr>
            </thead>

            <tbody>
              {dashboard.length === 0 ? (
                <tr>
                  <td colSpan="8">No data found</td>
                </tr>
              ) : (
                dashboard.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.base}</td>
                    <td>{item.equipment_type}</td>
                    <td>{item.opening_balance}</td>
                    <td>{item.closing_balance}</td>
                    <td
  onClick={() => setSelectedMovement(item)}
  style={{ cursor: "pointer", fontWeight: "600" }}
>
  {item.net_movement}
</td>
                    <td>{item.assigned}</td>
                    <td>{item.expended}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedMovement && (
  <div className="movement-popup">
    <div className="movement-popup-content">
      <h3>Net Movement Details</h3>

      <p>
        <strong>Purchases:</strong> {selectedMovement.purchases}
      </p>

      <p>
        <strong>Transfer In:</strong> {selectedMovement.transfer_in}
      </p>

      <p>
        <strong>Transfer Out:</strong> {selectedMovement.transfer_out}
      </p>

      <p>
        <strong>Net Movement:</strong> {selectedMovement.net_movement}
      </p>

      <button onClick={() => setSelectedMovement(null)}>
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}

function CommanderDashboard({ username }) {
  const [dashboard, setDashboard] = useState([]);
  const [error, setError] = useState("");

  const [date, setDate] = useState("");
  const [equipmentTypeId, setEquipmentTypeId] = useState("");
 
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedMovement, setSelectedMovement] = useState(null);


useEffect(() => {
  const fetchDashboard = async () => {
    try {
      const params = new URLSearchParams();

      if (date) {
        params.append("date", date);
      }

      

      if (equipmentTypeId) {
        params.append("equipment_type_id", equipmentTypeId);
      }

      const response = await fetch(
        `https://military-asset-management-production-581c.up.railway.app/api/dashboard/?${params.toString()}`,
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDashboard(data);
        setError("");
      } else {
        setError(data.error || "Failed to load dashboard");
      }
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  fetchDashboard();
}, [date,  equipmentTypeId]);

useEffect(() => {
  fetch("https://military-asset-management-production-581c.up.railway.app/api/equipment/", {
    credentials: "include",
  })
    .then((response) => response.json())
    .then((data) => {
      if (Array.isArray(data)) {
        setEquipmentTypes(data);
      }
    })
    .catch(() => {
      console.log("Unable to load equipment types");
    });
}, []);

  return (
    <div className="dashboard">
      
      <h2>Base Commander Dashboard</h2>
      <p>Welcome, {username}</p>

      {error && <p>{error}</p>}
      <button
  className="filter-toggle"
  onClick={() => setShowFilters(!showFilters)}
>
  ⚙ Filters
</button>

{showFilters && (
  <div className="filters">

    <div>
      <label>Date</label>
      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />
    </div>

    <div>
      <label>Equipment Type</label>
      <select
        value={equipmentTypeId}
        onChange={(e) => setEquipmentTypeId(e.target.value)}
      >
        <option value="">All Equipment</option>

        {equipmentTypes.map((equipment) => (
          <option key={equipment.id} value={equipment.id}>
            {equipment.name}
          </option>
        ))}
      </select>
    </div>

    <button
      onClick={() => {
        setDate("");
        setEquipmentTypeId("");
      }}
    >
      Clear Filters
    </button>

  </div>
)}

      {!error && (
  <div className="dashboard-card">
    <h3>Asset Summary</h3>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Base</th>
          <th>Equipment Type</th>
          <th>Opening Balance</th>
          <th>Closing Balance</th>
          <th>
  Net Movement<br />
  <small>(Click for details)</small>
</th>
          <th>Assigned</th>
          <th>Expended</th>
        </tr>
      </thead>

      <tbody>
        {dashboard.length === 0 ? (
          <tr>
            <td colSpan="8">No data found</td>
          </tr>
        ) : (
          dashboard.map((item, index) => (
            <tr key={index}>
              <td>{item.date}</td>
              <td>{item.base}</td>
              <td>{item.equipment_type}</td>
              <td>{item.opening_balance}</td>
              <td>{item.closing_balance}</td>
              <td
  onClick={() => setSelectedMovement(item)}
  style={{ cursor: "pointer", fontWeight: "600" }}
>
  {item.net_movement}
</td>
              <td>{item.assigned}</td>
              <td>{item.expended}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
)}
{selectedMovement && (
  <div className="movement-popup">
    <div className="movement-popup-content">
      <h3>Net Movement Details</h3>

      <p>
        <strong>Purchases:</strong> {selectedMovement.purchases}
      </p>

      <p>
        <strong>Transfer In:</strong> {selectedMovement.transfer_in}
      </p>

      <p>
        <strong>Transfer Out:</strong> {selectedMovement.transfer_out}
      </p>

      <p>
        <strong>Net Movement:</strong> {selectedMovement.net_movement}
      </p>

      <button onClick={() => setSelectedMovement(null)}>
        Close
      </button>
    </div>
  </div>
)}
    </div>
  );
}

function LogisticsDashboard({ username }) {
  return (
    <div className="dashboard">
      
      <h2>Logistics Dashboard</h2>
      <p>Welcome, {username}</p>
    </div>
  );
}


function PurchasesPage({ username, role, assignedBaseId }) {
    const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [baseId, setBaseId] = useState("");
  const [equipmentTypeId, setEquipmentTypeId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [purchaseDate, setPurchaseDate] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [equipment, setEquipment] = useState([]);

  const [filterDate, setFilterDate] = useState("");
  const [filterEquipment, setFilterEquipment] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const loadData = async () => {
    try {
      const [purchaseResponse, baseResponse, equipmentResponse] =
  await Promise.all([
    fetch(
      `https://military-asset-management-production-581c.up.railway.app/api/purchases/?purchase_date=${filterDate}&equipment_type_id=${filterEquipment}`,
      {
        credentials: "include",
      }
    ),
    fetch("https://military-asset-management-production-581c.up.railway.app/api/bases/", {
      credentials: "include",
    }),
    fetch("https://military-asset-management-production-581c.up.railway.app/api/equipment/", {
      credentials: "include",
    }),
  ]);
      const purchaseData = await purchaseResponse.json();
      const baseData = await baseResponse.json();
      const equipmentData = await equipmentResponse.json();
      console.log("PURCHASE EQUIPMENT DATA:", equipmentData);

      if (purchaseResponse.ok) {
        setPurchases(purchaseData);
      }

      if (baseResponse.ok) {
        setBases(baseData);
      }

      if (equipmentResponse.ok) {
  setEquipmentTypes(equipmentData);
  setEquipment(equipmentData);
}
    } catch (err) {
      setError("Unable to load purchase data");
    }
  };

  useEffect(() => {
  loadData();
}, [filterDate, filterEquipment]);

useEffect(() => {
  if (role === "BASE_COMMANDER" && assignedBaseId) {
    setBaseId(String(assignedBaseId));
  }
}, [role, assignedBaseId]);

  const handlePurchase = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "https://military-asset-management-production-581c.up.railway.app/api/purchases/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            base_id: Number(baseId),
            equipment_type_id: Number(equipmentTypeId),
            quantity: Number(quantity),
            purchase_date: purchaseDate,
            reference_number: referenceNumber,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage("Purchase added successfully");

        setBaseId("");
        setEquipmentTypeId("");
        setQuantity("");
        setPurchaseDate("");
        setReferenceNumber("");

        loadData();
      } else {
        setError(data.error || "Failed to add purchase");
      }
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="dashboard">
      
      <h2>Purchases</h2>
      <p>Welcome, {username}</p>

      
      <div className="dashboard-card">
        <h3>Add Purchase</h3>

        <form onSubmit={handlePurchase}>
          <div>
  <label>Base</label>

  {role === "BASE_COMMANDER" ? (
    <select value={baseId} disabled>
      <option value={baseId}>
        {bases.find(
          (base) => base.id === Number(assignedBaseId)
        )?.name || "Assigned Base"}
      </option>
    </select>
  ) : (
    <select
      value={baseId}
      onChange={(e) => setBaseId(e.target.value)}
      required
    >
      <option value="">Select Base</option>

      {bases.map((base) => (
        <option key={base.id} value={base.id}>
          {base.name}
        </option>
      ))}
    </select>
  )}
</div>

          <div>
            <label>Equipment Type</label>
            <select
              value={equipmentTypeId}
              onChange={(e) => setEquipmentTypeId(e.target.value)}
              required
            >
              <option value="">Select Equipment</option>

              {equipmentTypes.map((equipment) => (
                <option key={equipment.id} value={equipment.id}>
                  {equipment.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label>Quantity</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Purchase Date</label>
            <input
              type="date"
              value={purchaseDate}
              onChange={(e) => setPurchaseDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Reference Number</label>
            <input
              type="text"
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
            />
          </div>

          <button type="submit">Add Purchase</button>
        </form>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}
      </div>

     
      <div className="dashboard-card">
        <h3>Purchase History</h3>
        <button
  className="filter-toggle"
  onClick={() => setShowFilters(!showFilters)}
>
  ⚙ Filters
</button>

{showFilters && (
  <div className="filters">
  <label>Purchase Date</label>
  <input
    type="date"
    value={filterDate}
    onChange={(e) => setFilterDate(e.target.value)}
  />

  <label>Equipment Type</label>
  <select
    value={filterEquipment}
    onChange={(e) => setFilterEquipment(e.target.value)}
  >
    <option value="">All Equipment</option>

    {equipment.map((item) => (
      <option key={item.id} value={item.id}>
        {item.name}
      </option>
    ))}
  </select>

  <button
  onClick={() => {
    setFilterDate("");
    setFilterEquipment("");
  }}
>
  Clear Filters
</button>

</div>
)}

        <table>
          <thead>
            <tr>
              <th>Base</th>
              <th>Equipment Type</th>
              <th>Quantity</th>
              <th>Purchase Date</th>
              <th>Reference Number</th>
            </tr>
          </thead>

          <tbody>
            {purchases.length === 0 ? (
              <tr>
                <td colSpan="5">No purchases found</td>
              </tr>
            ) : (
              purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{purchase.base}</td>
                  <td>{purchase.equipment_type}</td>
                  <td>{purchase.quantity}</td>
                  <td>{purchase.purchase_date}</td>
                  <td>{purchase.reference_number}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}


function TransfersPage({ username, role, assignedBaseId }) {
    const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  const [sourceBase, setSourceBase] = useState("");
  const [destinationBase, setDestinationBase] = useState("");
  const [equipmentType, setEquipmentType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [transferDate, setTransferDate] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [transferResponse, baseResponse, equipmentResponse] =
        await Promise.all([
          fetch("https://military-asset-management-production-581c.up.railway.app/api/transfers/", {
            credentials: "include",
          }),
          fetch("https://military-asset-management-production-581c.up.railway.app/api/bases/", {
            credentials: "include",
          }),
          fetch("https://military-asset-management-production-581c.up.railway.app/api/equipment/", {
  credentials: "include",
}),
        ]);

      
      const baseData = await baseResponse.json();

      if (baseResponse.ok) {
        setBases(baseData);
      }

      console.log("BASE DATA:", baseData);
      console.log("BASES STATE:", bases);
      

      const transferData = await transferResponse.json();

      if (transferResponse.ok) {
        setTransfers(transferData);
      }

      

      const equipmentData = await equipmentResponse.json();


      if (equipmentResponse.ok) {
        setEquipmentTypes(equipmentData);
      }
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  const handleTransfer = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");

    try {
      const response = await fetch(
        "https://military-asset-management-production-581c.up.railway.app/api/transfers/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            source_base_id:
  role === "BASE_COMMANDER"
    ? assignedBaseId
    : sourceBase,
            destination_base_id: destinationBase,
            equipment_type_id: equipmentType,
            quantity: Number(quantity),
            transfer_date: transferDate,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Transfer completed successfully");

        setSourceBase("");
        setDestinationBase("");
        setEquipmentType("");
        setQuantity("");
        setTransferDate("");

        fetchData();
      } else {
        setError(data.error || "Transfer failed");
      }
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="dashboard">
      
      <h2>Transfers</h2>
      <p>Welcome, {username}</p>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <h3>Transfer Assets</h3>

      <form onSubmit={handleTransfer}>
       {role === "BASE_COMMANDER" ? (
  <select value={assignedBaseId || ""} disabled>
    <option value={assignedBaseId || ""}>
      {bases.find((base) => base.id === Number(assignedBaseId))?.name || "Source Base"}
    </option>
  </select>
) : (
  <select
    value={sourceBase}
    onChange={(e) => {
      setSourceBase(e.target.value);
      setDestinationBase("");
    }}
    required
  >
    <option value="">Select Source Base</option>

    {bases.map((base) => (
      <option key={base.id} value={base.id}>
        {base.name}
      </option>
    ))}
  </select>
)}

        <select
  value={destinationBase}
  onChange={(e) => setDestinationBase(e.target.value)}
  required
>
  <option value="">Select Destination Base</option>

  {bases
   .filter(
  (base) =>
    base.id !==
    Number(
      role === "BASE_COMMANDER"
        ? assignedBaseId
        : sourceBase
    )
)
    .map((base) => (
      <option key={base.id} value={base.id}>
        {base.name}
      </option>
    ))}
</select>
        <select
          value={equipmentType}
          onChange={(e) => setEquipmentType(e.target.value)}
          required
        >
          <option value="">Select Equipment</option>

          {equipmentTypes.map((equipment) => (
            <option key={equipment.id} value={equipment.id}>
              {equipment.name}
            </option>
          ))}
        </select>

        <input
          type="number"
          placeholder="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          min="1"
          required
        />

        <input
          type="date"
          value={transferDate}
          onChange={(e) => setTransferDate(e.target.value)}
          required
        />

        <button type="submit">Transfer</button>
      </form>

      <h3>Transfer History</h3>

      <table>
        <thead>
          <tr>
            <th>Source Base</th>
            <th>Destination Base</th>
            <th>Equipment Type</th>
            <th>Quantity</th>
            <th>Transfer Date</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {transfers.map((transfer) => (
            <tr key={transfer.id}>
              <td>{transfer.source_base}</td>
              <td>{transfer.destination_base}</td>
              <td>{transfer.equipment_type}</td>
              <td>{transfer.quantity}</td>
              <td>{transfer.transfer_date}</td>
              <td>{transfer.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AssignmentsPage({ username, role, assignedBaseId }) {
  const [assignments, setAssignments] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipment, setEquipment] = useState([]);

  const [baseId, setBaseId] = useState("");
  const [equipmentId, setEquipmentId] = useState("");
  const [personnelName, setPersonnelName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [assignedDate, setAssignedDate] = useState("");

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        "https://military-asset-management-production-581c.up.railway.app/api/assignments/",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setAssignments(data);
      } else {
        setError(data.error || "Failed to load assignments");
      }
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  const fetchBases = async () => {
  try {
    const response = await fetch(
      "https://military-asset-management-production-581c.up.railway.app/api/bases/",
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok) {
      setBases(data);
      setError("");
    } else {
      setError(data.error || "Failed to load bases");
    }
  } catch (err) {
    setError("Unable to load bases");
  }
};

  const fetchEquipment = async () => {
    try {
      const response = await fetch(
        "https://military-asset-management-production-581c.up.railway.app/api/equipment/",
        {
          credentials: "include",
        }
      );

      const data = await response.json();

      if (response.ok) {
        setEquipment(data);

        if (data.length > 0) {
          setEquipmentId(String(data[0].id));
        }
      } else {
        setError(data.error || "Failed to load equipment");
      }
    } catch (err) {
      setError("Unable to load equipment");
    }
  };

  useEffect(() => {
    fetchAssignments();
    fetchBases();
    fetchEquipment();
  }, []);

  useEffect(() => {
  if (role === "BASE_COMMANDER" && assignedBaseId) {
    setBaseId(String(assignedBaseId));
  }
}, [role, assignedBaseId]);

  const handleAssignment = async (event) => {
    event.preventDefault();

    setError("");
    setMessage("");

    try {
      const response = await fetch(
        "https://military-asset-management-production-581c.up.railway.app/api/assignments/",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            base_id: Number(baseId),
            equipment_type_id: Number(equipmentId),
            personnel_name: personnelName,
            quantity: Number(quantity),
            assigned_date: assignedDate,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to assign asset");
        return;
      }

      setMessage(data.message || "Asset assigned successfully");

      setPersonnelName("");
      setQuantity("");
      setAssignedDate("");

      fetchAssignments();
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  const handleReturn = async (assignmentId) => {
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `https://military-asset-management-production-581c.up.railway.app/api/assignments/${assignmentId}/return/`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to return asset");
        return;
      }

      setMessage(data.message || "Asset returned successfully");

      fetchAssignments();
    } catch (err) {
      setError("Unable to connect to server");
    }
  };

  return (
    <div className="dashboard">

      

      <h2>Assignments</h2>

      <p>Welcome, {username}</p>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      {message && (
        <p style={{ color: "green" }}>
          {message}
        </p>
      )}

      

      <div className="dashboard-card">

        <h3>Create Assignment</h3>

        <form onSubmit={handleAssignment}>

          <label>Base</label>

          {role === "BASE_COMMANDER" ? (
  <select value={baseId} disabled>
    <option value={baseId}>
      {bases.find(
        (base) => base.id === Number(assignedBaseId)
      )?.name || "Assigned Base"}
    </option>
  </select>
) : (
  <select
    value={baseId}
    onChange={(e) => setBaseId(e.target.value)}
    required
  >
    <option value="">Select Base</option>

    {bases.map((base) => (
      <option key={base.id} value={base.id}>
        {base.name}
      </option>
    ))}
  </select>
)}


          <label>Equipment Type</label>

          <select
            value={equipmentId}
            onChange={(e) => setEquipmentId(e.target.value)}
            required
          >
            <option value="">
              Select Equipment
            </option>

            {equipment.map((item) => (
              <option
                key={item.id}
                value={item.id}
              >
                {item.name}
              </option>
            ))}
          </select>


          <label>Personnel Name</label>

          <input
            type="text"
            value={personnelName}
            onChange={(e) =>
              setPersonnelName(e.target.value)
            }
            placeholder="Enter personnel name"
            required
          />


          <label>Quantity</label>

          <input
            type="number"
            min="1"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            placeholder="Enter quantity"
            required
          />


          <label>Assigned Date</label>

          <input
            type="date"
            value={assignedDate}
            onChange={(e) =>
              setAssignedDate(e.target.value)
            }
            required
          />


          <button type="submit">
            Assign Asset
          </button>

        </form>

      </div>


      

      <div className="dashboard-card">

        <h3>Assignment History</h3>

        <table>

          <thead>

            <tr>
              <th>Base</th>
              <th>Equipment Type</th>
              <th>Personnel</th>
              <th>Quantity</th>
              <th>Assigned Date</th>
              <th>Returned Date</th>
              <th>Status</th>
              <th>Action</th>
            </tr>

          </thead>


          <tbody>

            {assignments.length === 0 ? (

              <tr>
                <td colSpan="8">
                  No assignments found
                </td>
              </tr>

            ) : (

              assignments.map((assignment) => (

                <tr key={assignment.id}>

                  <td>
                    {assignment.base}
                  </td>

                  <td>
                    {assignment.equipment_type}
                  </td>

                  <td>
                    {assignment.personnel_name}
                  </td>

                  <td>
                    {assignment.quantity}
                  </td>

                  <td>
                    {assignment.assigned_date}
                  </td>

                  <td>
                    {assignment.returned_date || "-"}
                  </td>

                  <td>
                    {assignment.status}
                  </td>

                  <td>

                    {assignment.status === "ACTIVE" && (

                      <button
                        onClick={() =>
                          handleReturn(assignment.id)
                        }
                      >
                        Return
                      </button>

                    )}

                    {assignment.status === "RETURNED" && (
                      <span>Completed</span>
                    )}

                  </td>

                </tr>

              ))

            )}

          </tbody>

        </table>

      </div>

    </div>
  );
}


function ExpendituresPage({ username, role, assignedBaseId }) {
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
const [equipment, setEquipment] = useState([]);

const [baseId, setBaseId] = useState("");
const [equipmentTypeId, setEquipmentTypeId] = useState("");
const [quantity, setQuantity] = useState("");
const [expenditureDate, setExpenditureDate] = useState("");
const [reason, setReason] = useState("");
const [formMessage, setFormMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchExpenditures = async () => {
      try {
        const response = await fetch(
          "https://military-asset-management-production-581c.up.railway.app/api/expenditures/",
          {
            credentials: "include",
          }
        );

        const fetchBases = async () => {
  try {
    const response = await fetch(
      "https://military-asset-management-production-581c.up.railway.app/api/bases/",
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok) {
      setBases(data);
    }
  } catch (err) {
    setError("Unable to load bases");
  }
};

const fetchEquipment = async () => {
  try {
    const response = await fetch(
      "https://military-asset-management-production-581c.up.railway.app/api/equipment/",
      {
        credentials: "include",
      }
    );

    const data = await response.json();

    if (response.ok) {
      setEquipment(data);
    }
  } catch (err) {
    setError("Unable to load equipment");
  }
};

fetchBases();
fetchEquipment();

        const data = await response.json();

        if (response.ok) {
          setExpenditures(data);
        } else {
          setError(
            data.error || "Failed to load expenditures"
          );
        }
      } catch (err) {
        setError("Unable to connect to server");
      }
    };

    fetchExpenditures();
  }, []);

  const handleSubmit = async (e) => {
  e.preventDefault();

  setFormMessage("");

  try {
    const response = await fetch(
      "https://military-asset-management-production-581c.up.railway.app/api/expenditures/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          base_id: baseId,
          equipment_type_id: equipmentTypeId,
          quantity: quantity,
          expenditure_date: expenditureDate,
          reason: reason,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setFormMessage(data.message);

      setBaseId("");
      setEquipmentTypeId("");
      setQuantity("");
      setExpenditureDate("");
      setReason("");

      const updatedResponse = await fetch(
        "https://military-asset-management-production-581c.up.railway.app/api/expenditures/",
        {
          credentials: "include",
        }
      );

      const updatedData = await updatedResponse.json();

      if (updatedResponse.ok) {
        setExpenditures(updatedData);
      }
    } else {
      setFormMessage(
        data.error || "Failed to record expenditure"
      );
    }
  } catch (err) {
    setFormMessage("Unable to connect to server");
  }
};

  return (
    <div className="dashboard">

      

      <h2>Expenditures</h2>

      <p>Welcome, {username}</p>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

      

        <div className="dashboard-card">
  <h3>Create Expenditure</h3>

  <form onSubmit={handleSubmit}>

    <label>Base</label>
    <select
      value={baseId}
      onChange={(e) => setBaseId(e.target.value)}
    >
      <option value="">Select Base</option>

      {bases
  .filter(
    (base) =>
      role === "ADMIN" ||
      base.id === assignedBaseId
  )
  .map((base) => (
    <option key={base.id} value={base.id}>
      {base.name}
    </option>
  ))}
    </select>

    <label>Equipment Type</label>
    <select
      value={equipmentTypeId}
      onChange={(e) => setEquipmentTypeId(e.target.value)}
    >
      <option value="">Select Equipment</option>

      {equipment.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name}
        </option>
      ))}
    </select>

    <label>Quantity</label>
    <input
      type="number"
      min="1"
      value={quantity}
      onChange={(e) => setQuantity(e.target.value)}
      placeholder="Enter quantity"
    />

    <label>Expenditure Date</label>
    <input
      type="date"
      value={expenditureDate}
      onChange={(e) => setExpenditureDate(e.target.value)}
    />

    <label>Reason</label>
    <input
      type="text"
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      placeholder="Enter reason"
    />

    <button type="submit">
      Record Expenditure
    </button>

    {formMessage && <p>{formMessage}</p>}

  </form>
</div>

        <h3>Expenditure History</h3>

        <table>

          <thead>
            <tr>
              <th>Base</th>
              <th>Equipment Type</th>
              <th>Quantity</th>
              <th>Expenditure Date</th>
              <th>Reason</th>
            </tr>
          </thead>

          <tbody>
            {expenditures.length === 0 ? (
              <tr>
                <td colSpan="5">
                  No expenditures found
                </td>
              </tr>
            ) : (
              expenditures.map((expenditure) => (
                <tr key={expenditure.id}>
                  <td>{expenditure.base}</td>
                  <td>{expenditure.equipment_type}</td>
                  <td>{expenditure.quantity}</td>
                  <td>
                    {expenditure.expenditure_date}
                  </td>
                  <td>{expenditure.reason}</td>
                </tr>
              ))
            )}
          </tbody>

        </table>

      </div>

    
  );
}


function AuditLogsPage({ username }) {
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAuditLogs = async () => {
      try {
        const response = await fetch(
          "https://military-asset-management-production-581c.up.railway.app/api/audit-logs/",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setLogs(data);
        } else {
          setError(data.error || "Failed to load audit logs");
        }
      } catch (err) {
        setError("Unable to connect to server");
      }
    };

    fetchAuditLogs();
  }, []);

  return (
    <div className="dashboard">
     
      <h2>Audit Logs</h2>
      <p>Welcome, {username}</p>

      {error && <p>{error}</p>}

      <div className="dashboard-card">
        <table>
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Entity</th>
              <th>Entity ID</th>
              <th>Details</th>
            </tr>
          </thead>

          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan="6">No audit logs found</td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.timestamp).toLocaleString()}</td>
                  <td>{log.user}</td>
                  <td>{log.action}</td>
                  <td>{log.entity}</td>
                  <td>{log.entity_id}</td>
                  <td>{log.details}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AppHeader({ role, setPage }) {
  return (
    <header className="app-header">
      <div className="app-header-inner">

        <div className="app-title">
          Military Asset Management
        </div>

        <nav className="app-navigation">

          <button onClick={() => setPage("dashboard")}>
            Dashboard
          </button>

          <button onClick={() => setPage("purchases")}>
            Purchases
          </button>

          <button onClick={() => setPage("transfers")}>
            Transfers
          </button>

          {(role === "ADMIN" || role === "BASE_COMMANDER") && (
            <button onClick={() => setPage("assignments")}>
              Assignments
            </button>
          )}

          {(role === "ADMIN" || role === "BASE_COMMANDER") && (
            <button onClick={() => setPage("expenditures")}>
              Expenditures
            </button>
          )}

          {role === "ADMIN" && (
            <button onClick={() => setPage("audit-logs")}>
              Audit Logs
            </button>
          )}

        </nav>

      </div>
    </header>
  );
}

function App() {

  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(null);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState("dashboard");
  const [assignedBaseId, setAssignedBaseId] = useState(null);

  const [registerUsername, setRegisterUsername] = useState("");
const [registerPassword, setRegisterPassword] = useState("");
const [confirmPassword, setConfirmPassword] = useState("");
const [registerRole, setRegisterRole] = useState("");
const [registerBaseId, setRegisterBaseId] = useState("");
const [registerMessage, setRegisterMessage] = useState("");
const [registerError, setRegisterError] = useState("");
const [registerBases, setRegisterBases] = useState([]);
  

  const handleLogin = async (e) => {
    e.preventDefault();

    setMessage("Logging in...");

    try {
      const response = await fetch("https://military-asset-management-production-581c.up.railway.app/api/login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setRole(data.role);
        setUsername(data.username);
        setAssignedBaseId(data.base_id);
        setMessage("");
      }
      else {
        setMessage(data.error || "Login failed");
      }
    } catch (error) {
      setMessage("Unable to connect to server");
    }
  };

  const handleRegister = async (e) => {
  e.preventDefault();

  setRegisterMessage("");
  setRegisterError("");

  if (registerPassword !== confirmPassword) {
    setRegisterError("Passwords do not match");
    return;
  }

  try {
    const response = await fetch(
      "https://military-asset-management-production-581c.up.railway.app/api/register/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          username: registerUsername,
          password: registerPassword,
          confirm_password: confirmPassword,
          role: registerRole,
          base_id:
            registerRole === "BASE_COMMANDER"
              ? Number(registerBaseId)
              : null,
        }),
      }
    );

    const data = await response.json();

    if (response.ok) {
      setRegisterMessage("Registration successful. Please login.");

      setRegisterUsername("");
      setRegisterPassword("");
      setConfirmPassword("");
      setRegisterRole("");
      setRegisterBaseId("");
    } else {
      setRegisterError(data.error || "Registration failed");
    }
  } catch (error) {
    setRegisterError("Unable to connect to server");
  }
};

useEffect(() => {
  if (page === "register") {
    const fetchRegisterBases = async () => {
      try {
        const response = await fetch(
          "https://military-asset-management-production-581c.up.railway.app/api/registration-bases/",
          {
            credentials: "include",
          }
        );

        const data = await response.json();

        if (response.ok) {
          setRegisterBases(data);
        } else {
          setRegisterError(
            data.error || "Failed to load bases"
          );
        }
      } catch (error) {
        setRegisterError("Unable to load bases");
      }
    };

    fetchRegisterBases();
  }
}, [page]);

if (page === "register") {
  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Military Asset Management</h1>
        <h2>Register</h2>

        <form onSubmit={handleRegister}>
          <input
            type="text"
            placeholder="Username"
            value={registerUsername}
            onChange={(e) => setRegisterUsername(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={registerPassword}
            onChange={(e) => setRegisterPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <select
            value={registerRole}
            onChange={(e) => setRegisterRole(e.target.value)}
            required
          >
            <option value="">Select Role</option>
            <option value="ADMIN">Admin</option>
            <option value="BASE_COMMANDER">Base Commander</option>
            <option value="LOGISTICS_OFFICER">
              Logistics Officer
            </option>
          </select>

          {registerRole === "BASE_COMMANDER" && (
            <select
              value={registerBaseId}
              onChange={(e) => setRegisterBaseId(e.target.value)}
              required
            >
              <option value="">Select Base</option>

              {registerBases.map((base) => (
                <option key={base.id} value={base.id}>
                  {base.name}
                </option>
              ))}
            </select>
          )}

          <button type="submit">Register</button>

          <button
            type="button"
            onClick={() => {
              setPage("dashboard");
              setRegisterMessage("");
              setRegisterError("");
            }}
          >
            Back to Login
          </button>
        </form>

        {registerMessage && <p>{registerMessage}</p>}
        {registerError && <p>{registerError}</p>}
      </div>
    </div>
  );
}

  if (role === "ADMIN") {
  if (page === "purchases") {
    return (
  <>
    <AppHeader
      role={role}
      setPage={setPage}
    />

    <PurchasesPage username={username} />
  </>
);
  }

  if (page === "transfers") {
    return (
  <>
    <AppHeader
      role={role}
      setPage={setPage}
    />

    <TransfersPage
      username={username}
    />
  </>
);
  }

  if (page === "assignments") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <AssignmentsPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
}

if (page === "audit-logs") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <AuditLogsPage username={username} />
    </>
  );
}
if (page === "expenditures") {
 if (page === "expenditures") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <ExpendituresPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
 }
}

  return (
  <>
    <AppHeader
      role={role}
      setPage={setPage}
    />

    <AdminDashboard username={username} />
  </>
);
  }

  if (role === "BASE_COMMANDER") {
    if (page === "purchases") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <PurchasesPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
}

if (page === "assignments") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <AssignmentsPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
}


  if (page === "transfers") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <TransfersPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
}

  if (page === "expenditures") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <ExpendituresPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
}

  return (
  <>
    <AppHeader
      role={role}
      setPage={setPage}
    />

    <CommanderDashboard username={username} />
  </>
);
}

  if (role === "LOGISTICS_OFFICER") {
  if (page === "purchases") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <PurchasesPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
}

  if (page === "transfers") {
  return (
    <>
      <AppHeader
        role={role}
        setPage={setPage}
      />

      <TransfersPage
        username={username}
        role={role}
        assignedBaseId={assignedBaseId}
      />
    </>
  );
}
  return (
  <>
    <AppHeader
      role={role}
      setPage={setPage}
    />

    <LogisticsDashboard username={username} />
  </>
);
}

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Military Asset Management</h1>
        <h2>Login</h2>

        <form onSubmit={handleLogin}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit">Login</button>
          <button
  type="button"
  onClick={() => {
    setPage("register");
    setMessage("");
  }}
>
  Register
</button>
        </form>

        {message && <p>{message}</p>}
      </div>
    </div>
  );
}



export default App;