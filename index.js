import fetch from 'node-fetch';
import { writeFileSync } from 'fs';
import { load } from 'cheerio';
import ics from 'ics';

const url = 'https://www.liturgybrisbane.net.au/resources/liturgical-calendars/2024-liturgical-calendar/';

const specialEvent = (eventTitle, eventDate) => {
    return eventTitle !== eventDate
        && !eventTitle.includes("Monday")
        && !eventTitle.includes("Tuesday")
        && !eventTitle.includes("Wednesday")
        && !eventTitle.includes("Thursday")
        && !eventTitle.includes("Friday")
        && !eventTitle.includes("Saturday")
}

const writeToFile = async (filePath, events) => {
    // Create the ICS file
    const { error, value } = ics.createEvents(events);
    if (error) {
      console.error(error);
    } else {
        await writeFileSync(filePath, value); 
      // You can save the calendarFile to a file or do something else with it
    }
}

fetch(url)
  .then(response => response.text())
  .then(async html => {
    const $ = load(html);
    const feasts = [];
    const solemnities = [];

    // Find the table element and loop through each row
    $('tbody tr').each( (index, element) => {
      if (index !== 0) { // Skip the header row
        const cells = $(element).find('td');
        const eventDateStr = $(cells[0]).text().trim();
        const eventTitle = $(cells[1]).text().trim();
        const isFeast = $(cells[1].children[0]).is('strong');
        if (eventDateStr.trim().length && specialEvent(eventTitle, eventDateStr)){
            const eventDateStr1 = eventDateStr + " 2024";
            const eventDate = new Date(eventDateStr1).getTime();
    
            const event = {
                start: eventDate,
                end: eventDate,
                title: eventTitle,
              };
            if (eventTitle == eventTitle.toUpperCase()){
                solemnities.push(event);
            }
            if (isFeast){
                feasts.push(event);
            }
          }
        }

    });
    await writeToFile('solemnities.ics', solemnities);
    await writeToFile('feasts.ics', feasts);
  })
  .catch(error => console.error(error));