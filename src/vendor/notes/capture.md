# Capture Notes:

Requirements for capture:
1. User must be logged in
2. User must have a role of timer 
3. If there is a reservation then user must have the reservation

Senarios for capture:
1. Transcript with no timing
2. Transcript with timing - this is editing an existing timing
  a. paragraph scroll is disabled

Capture features:
1. Send dialog is automatically displayed when the audio ends
2. If some paragraphs are missing timing a message is displayed
3. If data fails to send it is persisted to local storage and the send
   dialog will be automatically displayed the next time user displays the page
4. Intermediate timing data is stored locally and restored automatically, advancing
   the audio playback position if timing was incomplete when the page is refreshed

Testing senarios:
1. No timing data and user is not logged in
2. No timing data and user is logged in but not a timer
3. No timing data and user is logged and is a timer
  a. there is no reservation
  b. there is a reservation but not for the logged in timer
  c. there is a reservation and it is for the logged in timer
  d. timing session completes with out interruption
  e. submit fails at end of timing session
  f. timing is not completed and continues with next page refresh
4. Timing data and user is not logged in
5. Timing data and user is logged in but not a timer
6. Timing data and user is logged in and is a timer
  a. there is no reservation
  b. there is a reservation but not for the logged in timer
  c. there is a reservation and it is for the logged in timer
  d. timing session completes with out interruption
  e. submit fails at end of timing session
  f. timing is not completed and continues with next page refresh