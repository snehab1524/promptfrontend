// TEST SCRIPT FOR LEVEL 3 (ADVANCED) PROGRESS STORAGE
// Run this in browser console after completing an advanced level

const testAdvancedLevelProgress = async () => {
  console.log("🧪 Testing Advanced Level Progress Storage...\n");

  // Get current user
  const userStr = localStorage.getItem("user");
  if (!userStr) {
    console.error("❌ No user logged in");
    return;
  }
  
  const user = JSON.parse(userStr);
  console.log("👤 Current User:", user.email);

  // Get token
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("❌ No token found");
    return;
  }

  try {
    // Fetch latest progress from backend
    console.log("\n📡 Fetching progress from backend...");
    const response = await fetch("http://localhost:7000/get-progress", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      console.error("❌ Backend error:", response.status);
      return;
    }

    const backendData = await response.json();
    console.log("✅ Backend Progress:");
    console.table({
      "Completed Levels": JSON.stringify(backendData.completedLevels),
      "Current Level": backendData.currentLevelId,
      "Certificates Count": backendData.certifications?.length || 0,
      "Certificates": JSON.stringify(backendData.certifications)
    });

    // Check localStorage
    console.log("\n💾 LocalStorage Progress:");
    const emailKey = user.email.replace(/[@.]/g, '_');
    const promptMasterKey = `prompt_master_data_${emailKey}`;
    const localStorageData = JSON.parse(localStorage.getItem(promptMasterKey) || "{}");
    
    if (localStorageData.progress) {
      console.table({
        "Completed Levels": JSON.stringify(localStorageData.progress.completedLevels),
        "Current Level": localStorageData.progress.currentLevelId,
        "Certificates Count": localStorageData.progress.certifications?.length || 0,
        "Certificates": JSON.stringify(localStorageData.progress.certifications)
      });
    } else {
      console.log("⚠️ No progress data in localStorage");
    }

    // Check for advanced levels
    console.log("\n🔍 Advanced Level Analysis:");
    const allLevels = backendData.completedLevels || [];
    const advancedLevels = allLevels.filter(l => l.includes('advanced-'));
    const advancedCerts = (backendData.certifications || []).filter(c => c.includes('Advanced'));
    
    console.log("Advanced Levels Completed:", advancedLevels.length > 0 ? advancedLevels : "None");
    console.log("Advanced Certificates Earned:", advancedCerts.length > 0 ? advancedCerts : "None");

    if (advancedLevels.length > 0 && advancedCerts.length === 0) {
      console.error("❌ BUG DETECTED: Advanced levels completed but no certificates!");
    } else if (advancedLevels.length > 0 && advancedCerts.length > 0) {
      console.log("✅ Advanced levels and certificates in sync");
    }

  } catch (error) {
    console.error("❌ Error:", error.message);
  }
};

// Run the test
testAdvancedLevelProgress();
