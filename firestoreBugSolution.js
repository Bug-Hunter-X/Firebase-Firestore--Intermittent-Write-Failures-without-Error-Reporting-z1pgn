The solution involves implementing exponential backoff retry logic.  This approach handles transient network issues by repeatedly attempting the write operation with increasing delays between attempts.  The code also includes detailed error handling to capture and log any exceptions that occur during the process.

```javascript
const retry = require('async-retry');

async function writeDataToFirestore(db, data) {
  try {
    await retry(async bail => {
      try {
        await db.collection('myCollection').doc('myDoc').set(data);
      } catch (error) {
        console.error('Firestore write error:', error);
        if (error.code === 'unavailable') {
          // Retry on unavailable error
          throw error; // Re-throw for retry
        } else {
          // Other errors are probably not recoverable, bail out.
          bail(error);
        }
      }
    }, {
      retries: 5,
      factor: 2,
      minTimeout: 1000,
      maxTimeout: 5000,
    });
    console.log('Data written successfully!');
  } catch (error) {
    console.error('Data write failed after multiple retries:', error);
  }
}
```