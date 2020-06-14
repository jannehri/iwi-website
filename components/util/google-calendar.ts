import { google } from 'googleapis'
import { join } from 'path';
import fs from 'fs';

/* This utility reads from the Google Calendar API. This
 * needs proper authorization. We use a service account.
 * The service account doesn't need any explicit permissions,
 * but the calendar in question must be shared with the
 * account. The credentials.json file can be added by anyone
 * with access to the Google Account of the "Fachschaft".
 * Anyone else will not be able to display events locally.
 */
async function getCalendarEvents() {
    // if the credentials file doesn't exist, we can't get events
    if(!credentialsFileExists()) return null

    const auth = new google.auth.GoogleAuth({
        keyFile: join(process.cwd(),'credentials.json'),
        scopes: ['https://www.googleapis.com/auth/calendar.readonly'],
    })

    const calendar = google.calendar({version: 'v3', auth});

    const response = await calendar.events.list({
        // This calendar id is public, so it's not as bad to have it
        // in the source code. It can still be managed as an env var
        // later, that would probably feel more correct.
        calendarId: 'f229fvilfl8peun924t109pouo@group.calendar.google.com',
        timeMin: (new Date()).toISOString(),
        maxResults: 9,
        singleEvents: true,
        orderBy: 'startTime',
      });

    return response.data.items
}

function credentialsFileExists() {
    const filePath = join(process.cwd(),'credentials.json')
    const fileExists = fs.existsSync(filePath)
    
    if(fileExists) return true
    
    console.error(
        "The credential file is not present at the expected path:\n\n" +
        "    " + filePath + "\n\n" +
        "You won't be able to work on the calendar events component " +
        "unless you make sure the credentials.json file for the " +
        "service account is present at this location."
    )
    return false
}

export default getCalendarEvents