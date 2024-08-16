// import React, { useState, useEffect } from 'react';
// import './index.css';
import styled from 'styled-components';
import tw from 'twin.macro';
import vite from '/vite.svg';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const token = localStorage.getItem('accessToken'); // Retrieve token from storage

const socket = io('http://localhost:4000', {
  auth: {
    token,
  },
});

const App = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchNotifications = async () => {
      const token = localStorage.getItem('accessToken'); // Retrieve token from storage

      const response = await fetch('http://localhost:4000/notifications', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      console.log('data', data);
      setNotifications(data);
    };

    // Fetch initial notifications from the server
    fetchNotifications();

    // Listen for new notifications
    socket.on('notification', (notification) => {
      setNotifications((prevNotifications) => [
        notification,
        ...prevNotifications,
      ]);
    });

    // Cleanup on component unmount
    return () => {
      socket.off('notification');
    };
  }, []);

  return (
    <ApplicationContainer>
      <SectionContainer>
        <Image src={vite} alt='Vite Logo' />
        <CenteredText>
          <H2>Demonstration</H2>
          <Title>E2E-Notification-system</Title>
        </CenteredText>
        <NotificationSection>
          <NotificationHeader>Notifications</NotificationHeader>
          <NotificationList>
            {notifications.map((notification) => (
              <NotificationItem key={notification._id}>
                {notification.message}
              </NotificationItem>
            ))}
          </NotificationList>
        </NotificationSection>
      </SectionContainer>
    </ApplicationContainer>
  );
};

export default App;

const ApplicationContainer = tw.div`bg-gradient-to-r from-indigo-500 to-purple-500 h-screen flex items-center justify-center`;

const SectionContainer = tw.div`bg-white shadow-lg rounded-lg p-8 max-w-3xl mx-auto`;

const CenteredText = tw.div`text-center`;

const H2 = tw.h2`font-bold text-lg text-indigo-600 uppercase tracking-wider mb-2`;

const Title = tw.p`text-gray-800 text-3xl sm:text-4xl font-extrabold leading-tight`;

const Author = tw.p`text-gray-600 mt-3`;

const Image = tw.img`h-20 w-auto mx-auto my-6`;

const NotificationSection = tw.div`mt-10`;

const NotificationHeader = tw.h3`text-xl font-semibold text-gray-700 mb-4`;

const NotificationList = tw.ul`space-y-3`;

const NotificationItem = styled.li`
  ${tw`bg-indigo-100 text-indigo-700 p-4 rounded-lg shadow-md transition-all duration-300 ease-in-out`}
  &:hover {
    ${tw`bg-indigo-200`}
  }
`;
