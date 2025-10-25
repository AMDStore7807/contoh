# TODO: Implement Home Page with Devices List

- [x] Create `src/pages/Home.tsx`: Page component that renders the devices list.
- [x] Create `src/components/DevicesList.tsx`: Component to fetch and display devices using `queryDevices`, with loading/error states. Display in a list of cards showing key info like \_id and \_lastInform.
- [x] Update `src/App.tsx`: Add protected /home route (redirect to /login if no token).
- [x] Update `src/components/login-form.tsx`: Redirect to /home after successful login.
- [x] Test the functionality by running the app and ensuring backend is running on 7557.
