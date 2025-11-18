import 'dotenv/config';
import app from '@/app.js';
const PORT = process.env.PORT || 3000;
// === Start Server ===
app.listen(PORT, () => {
  console.log('🚀 Server Started Successfully');
});
