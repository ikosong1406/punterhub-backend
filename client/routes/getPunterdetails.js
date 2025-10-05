import express from "express";
import User from "../models/user.schema.js";
import Signal from "../models/signal.schema.js"; 

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { punterId, plan } = req.body;

    if (!punterId) {
      return res.status(400).json({ error: "Punter ID is required" });
    }

    // --- 1. Define Tip Type Visibility based on Plan ---
    let allowedTipTypes = ["free"]; // Default visibility

    if (plan && typeof plan === 'string') {
      const lowerCasePlan = plan.toLowerCase();

      if (lowerCasePlan === "silver") {
        allowedTipTypes = ["free", "silver"];
      } else if (lowerCasePlan === "gold") {
        allowedTipTypes = ["free", "silver", "gold"];
      } else if (lowerCasePlan === "diamond") {
        // Diamond plan sees all signals (we handle this by *not* restricting tipType)
        allowedTipTypes = null; 
      }
      // Unrecognized plan defaults to 'free' signals.
    }

    // --- 2. Find Punter ---
    const punter = await User.findOne({ _id: punterId, isPunter: true });

    if (!punter) {
      return res.status(404).json({ error: "Punter not found" });
    }

    // --- 3. Build Signal Query to include both Pinned and Plan-Specific Signals ---
    
    // Base query: Match signals belonging to this punter
    const baseMatch = {
      _id: { $in: punter.signals },
    };

    // Pinned signal query: Signals that are pinned
    const pinnedQuery = {
      ...baseMatch,
      isPinned: true,
    };

    // Plan-specific query: Signals that match the user's subscription level
    let planQuery = {
      ...baseMatch,
      isPinned: { $ne: true }, // Exclude pinned signals to avoid duplicates
    };
    
    if (allowedTipTypes) {
        // Apply the tipType filter for non-pinned signals unless it's a top-tier plan
        planQuery.tipType = { $in: allowedTipTypes };
    }
    // If allowedTipTypes is null (diamond plan), we don't add the tipType filter, 
    // effectively getting all non-pinned signals for the punter.


    // --- 4. Find Signals using $or for both Pinned and Plan-Specific Criteria ---
    // We use an $or condition to fetch signals that are EITHER pinned OR meet the plan's criteria.
    const signals = await Signal.find({
        $or: [
            pinnedQuery, // Always include pinned signals
            planQuery   // Include non-pinned signals based on plan (or all if diamond)
        ]
    });
    
    // NOTE: The `$or` approach above can sometimes lead to duplicates if the 
    // logic isn't perfectly mirrored. A simpler, more reliable approach is to 
    // fetch the plan-specific signals and *ensure* pinned signals are included 
    // by modifying the `tipType` filter itself, or fetching and merging:
    
    // --- ALTERNATE (Cleaner) APPROACH: Use $in for tipType and $or for isPinned ---

    let finalTipTypeCriteria = {};
    if (allowedTipTypes) {
        // If restricted by plan, the signal must be EITHER pinned OR match the tipType
        finalTipTypeCriteria = { $or: [
            { isPinned: true },
            { tipType: { $in: allowedTipTypes } }
        ]};
    } else {
        // If not restricted by plan (diamond), no tipType criteria is needed
        finalTipTypeCriteria = {};
    }

    const finalQuery = {
        _id: { $in: punter.signals },
        ...finalTipTypeCriteria
    };
    
    const finalSignals = await Signal.find(finalQuery);


    // --- 5. Respond ---
    res.status(200).json({
      status: "ok",
      data: {
        punter: punter,
        signals: finalSignals, // Use the result of the final, clean query
      },
    });

  } catch (error) {
    console.error("Error in getPunterdetails:", error);
    res.status(500).json({ error: "Server error", details: error.message });
  }
});

export default router;