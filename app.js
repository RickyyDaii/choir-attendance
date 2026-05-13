const CHURCH_LAT = 49.21694724200739 
const CHURCH_LNG = -123.0655343441384
const MAX_DISTANCE = 150

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3
    const toRad = x => x * Math.PI / 180

    const dLat = toRad(lat2 - lat1)
    const dLon = toRad(lon2 - lon1)

    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))

    return R * c
}

async function checkIn() {

  console.log("Check-in clicked")

  const name = document.getElementById("name").value
  const status = document.getElementById("status")

  if (!name) {
    status.innerText = "❌ Please enter your name"
    return
  }

  status.innerText = "📍 Getting location... please wait"

  navigator.geolocation.getCurrentPosition(

    async (pos) => {

      console.log("GPS success", pos)

      const lat = pos.coords.latitude
      const lng = pos.coords.longitude

      const distance = getDistance(
        lat,
        lng,
        CHURCH_LAT,
        CHURCH_LNG
      )

      console.log("Distance:", distance)

      if (distance > MAX_DISTANCE) {
        status.innerText = `❌ Too far (${Math.round(distance)}m)`
        return
      }

      status.innerText = "💾 Saving check-in..."

      const { error } = await supabaseClient.from("attendance").insert([
        {
          name,
          latitude: lat,
          longitude: lng,
          distance
        }
      ])

      if (error) {
        console.log(error)
        status.innerText = "❌ Database error"
      } else {
        status.innerText = "✅ Check-in successful!"
      }

    },

    (err) => {
      console.log("GPS ERROR:", err)
      status.innerText = "❌ Location failed: " + err.message
    },

    {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    }

  )
}
