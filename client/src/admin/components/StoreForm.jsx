import { useState, useEffect } from "react";
import { decodeTokenPayload, normalizeToken } from "helpers/token";
import AdminAPI, { getSellersWithoutStore } from "../api/adminApi";  // ✅ Import function mới

export default function StoreForm({ onSaved, initial = null, onCancel }) {
  const [name, setName] = useState(initial?.name || "");
  const [description, setDescription] = useState(initial?.description || "");
  const [email, setEmail] = useState(initial?.email || "");
  const [phone, setPhone] = useState(initial?.phone || "");
  const [ownerId, setOwnerId] = useState(initial?.owner_id || "");
  const [isActive, setIsActive] = useState(initial?.is_active !== false);
  const [sellers, setSellers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSellers, setFetchingSellers] = useState(true);
  const [authError, setAuthError] = useState("");

  // Check token on mount
  useEffect(() => {
    const token = normalizeToken(localStorage.getItem("token"));
    if (!token) {
      setAuthError("Please login as admin to load sellers.");
      setFetchingSellers(false);
      console.error("❌ No token in localStorage – cannot fetch sellers");
      return;
    }
    // Log token payload để verify role/exp
    const payload = decodeTokenPayload(token);
    if (payload) {
      console.log("🔍 Token Payload:", payload);  // Should show roles: "admin", exp not expired
    } else {
      console.warn("⚠️ Unable to decode admin token payload");
    }
    console.log("✅ Token found, proceeding to fetch sellers");
  }, []);

  // Fetch sellers only if token exists (chỉ sellers chưa có store)
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token || authError) return;

    const fetchSellers = async () => {
      try {
        const res = await getSellersWithoutStore();  // ✅ SỬA: Dùng function mới
        setSellers(res || []);
        console.log("🔍 Loaded sellers without store:", res?.length || 0);  // Debug
        // If editing, ensure current owner is included (nếu owner hiện tại không trong list, fetch riêng)
        if (initial && initial.owner_id && !res.some(s => s.user_id === initial.owner_id)) {
          try {
            const ownerRes = await AdminAPI.get(`/api/users/${initial.owner_id}`);
            const owner = ownerRes.data;
            if (owner && owner.roles === 'seller') {  // Khớp schema: roles VARCHAR
              setSellers(prev => [...prev, owner]);
              console.log("🔍 Added current owner to list:", owner.username);
            }
          } catch (ownerErr) {
            console.warn("Could not fetch specific owner:", ownerErr);
          }
        }
        setAuthError("");
      } catch (err) {
        console.error("Error fetching available sellers:", err);
        const msg = err?.response?.data?.message || "Unauthorized access";
        if (err.response?.status === 401) {
          setAuthError(`Auth failed: ${msg}. Check role or relogin.`);
          console.error("🔴 401 Error details:", err.response.data);  // Debug chi tiết
        } else {
          alert("Cannot load sellers without store: " + msg);
        }
      } finally {
        setFetchingSellers(false);
      }
    };

    fetchSellers();
  }, [initial?.owner_id, authError]);

  const submit = async (e) => {
    e.preventDefault();
    
    if (!ownerId) {
      alert("Please select a seller as store owner");
      return;
    }

    setLoading(true);
    try {
      // ✅ CHUYỂN SANG DÙNG JSON THAY VÌ FORMDATA
      const storeData = {
        name,
        description,
        email,
        phone,
        owner_id: parseInt(ownerId), // ✅ Đảm bảo là number
        is_active: isActive
      };

      console.log("🔍 DEBUG - JSON data to send:", storeData);

      let res;
      if (initial && initial.id) {
        res = await AdminAPI.put(`/api/stores/${initial.id}`, storeData);
      } else {
        res = await AdminAPI.post("/api/stores", storeData);
      }

      onSaved && onSaved(res.data);
    } catch (err) {
      console.error("Save store error:", err?.response?.data || err);
      const msg = err?.response?.data?.message || "Save failed";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-3 p-4 border rounded bg-white">
      <div>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Store Name"
          className="w-full p-2 border"
        />
      </div>
      <div>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          type="email"
          className="w-full p-2 border"
        />
      </div>
      <div>
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Phone Number"
          className="w-full p-2 border"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Owner (Sellers without store)</label>
        {authError ? (
          <div className="p-2 bg-red-100 border border-red-400 rounded text-red-700">{authError}</div>
        ) : fetchingSellers ? (
          <p>Loading sellers without store...</p>
        ) : (
          <select
            value={ownerId}
            onChange={(e) => setOwnerId(e.target.value)}
            required
            className="w-full p-2 border"
          >
            <option value="">Select a seller without store</option>
            {sellers.map((seller) => (
              <option key={seller.user_id || seller.id} value={seller.user_id || seller.id}>
                {seller.fullname} ({seller.username || seller.email})
              </option>
            ))}
          </select>
        )}
      </div>
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full p-2 border"
        />
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="mr-2"
        />
        <label htmlFor="isActive">Is Active</label>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded"
          disabled={loading || fetchingSellers || !!authError}
        >
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border rounded"
          disabled={loading}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}