import React, { useState, useEffect, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext.tsx';
import { Group } from '../types';

interface GroupUser {
  id: string;
  email: string;
  role_in_group: string;
}

interface CardList {
  id: string;
  title: string;
  cards_count: number;
}

const API_BASE = '';

const Groups: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cardsNum, setCardsNum] = useState(5);
  const [groups, setGroups] = useState<Group[]>([]);
  const [newGroupName, setNewGroupName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [groupUsers, setGroupUsers] = useState<GroupUser[]>([]);
  const [groupCardLists, setGroupCardLists] = useState<CardList[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newCardListTitle, setNewCardListTitle] = useState('');
  const [newCardListText, setNewCardListText] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileType, setFileType] = useState<'text' | 'txt' | 'pdf'>('text');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroups();
  }, []);

  const refreshAccessToken = async (): Promise<string | null> => {
    try {
      const response = await fetch(`${API_BASE}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('token_type', data.token_type);
        return data.access_token;
      } else {
        navigate('/login');
        return null;
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      navigate('/login');
      return null;
    }
  };

  const authenticatedFetch = async (url: string, options: RequestInit = {}): Promise<Response> => {
  const fullUrl = url.startsWith('http') ? url : `${API_BASE}${url}`;
  
  const token = localStorage.getItem('access_token');
  
  const headers = new Headers(options.headers);
  
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const isFormData = options.body instanceof FormData;
  if (!isFormData && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let response = await fetch(fullUrl, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    
    if (newToken) {
      headers.set('Authorization', `Bearer ${newToken}`);
      
      response = await fetch(fullUrl, {
        ...options,
        headers,
        credentials: 'include',
      });
    }
  }

  return response;
};

  const fetchGroups = async () => {
    try {
      const response = await authenticatedFetch('/groups/my');
      const data = await response.json();
      setGroups(data);
    } catch (error) {
      console.error('Error fetching groups:', error);
      setError('Failed to fetch groups');
    }
  };

  const createGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const response = await authenticatedFetch('/groups/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: newGroupName })
      });
      
      if (response.ok) {
        setNewGroupName('');
        fetchGroups();
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to create group');
      }
    } catch (error) {
      console.error('Error creating group:', error);
      setError('Failed to create group');
    }
  };

  const openManageModal = async (group: Group) => {
    setSelectedGroup(group);
    setError(null);
    await Promise.all([
      fetchGroupUsers(group.id),
      fetchGroupCardLists(group.id)
    ]);
    setIsOpen(true);
  };

  const fetchGroupUsers = async (groupId: string) => {
    try {
      const response = await authenticatedFetch(`/groups/${groupId}/users`);
      const data = await response.json();
      setGroupUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching group users:', error);
      setError('Failed to fetch group users');
    }
  };

  const fetchGroupCardLists = async (groupId: string) => {
    try {
      const response = await authenticatedFetch(`/groups/${groupId}/card_lists`);
      const data = await response.json();
      setGroupCardLists(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching card lists:', error);
      setError('Failed to fetch card lists');
    }
  };

  const closeModal = () => {
    setIsOpen(false);
    setSelectedGroup(null);
    setGroupUsers([]);
    setGroupCardLists([]);
    setError(null);
    setNewUserId('');
    setNewCardListTitle('');
    setNewCardListText('');
    setSelectedFile(null);
    setFileType('text');
    setCardsNum(5);
  };

  const addUserToGroup = async () => {
    if (!newUserId.trim() || !selectedGroup) return;
    try {
      const response = await authenticatedFetch(`/groups/${selectedGroup.id}/add_user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: newUserId, role_in_group: 'member' })
      });
      
      if (response.ok) {
        setNewUserId('');
        await fetchGroupUsers(selectedGroup.id);
        await fetchGroups();
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to add user');
      }
    } catch (error) {
      console.error('Error adding user:', error);
      setError('Failed to add user');
    }
  };

  const removeUserFromGroup = async (userId: string) => {
    if (!selectedGroup) return;
    try {
      const response = await authenticatedFetch(`/groups/${selectedGroup.id}/remove_user/${userId}`, {
        method: 'DELETE'
      });
      
      if (response.ok) {
        await fetchGroupUsers(selectedGroup.id);
        await fetchGroups();
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to remove user');
      }
    } catch (error) {
      console.error('Error removing user:', error);
      setError('Failed to remove user');
    }
  };

  const addCardListToGroup = async () => {
    if (!newCardListTitle.trim() || !selectedGroup) return;
    if (fileType === 'text' && !newCardListText.trim()) return;
    if ((fileType === 'txt' || fileType === 'pdf') && !selectedFile) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append('title', newCardListTitle);
      formData.append('cards_num', cardsNum.toString());
      formData.append('group_id', selectedGroup.id);

      let url = '/card_lists/upload_text';
      if (fileType === 'text') {
        formData.append('text', newCardListText);
      } else if (fileType === 'txt') {
        url = '/card_lists/upload_txt';
        formData.append('file', selectedFile!);
      } else if (fileType === 'pdf') {
        url = '/card_lists/upload_pdf';
        formData.append('file', selectedFile!);
      }

      const response = await authenticatedFetch(url, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewCardListTitle('');
        setNewCardListText('');
        setSelectedFile(null);
        setCardsNum(5);
        await fetchGroupCardLists(selectedGroup.id);
      } else {
        const error = await response.json();
        setError(error.detail || 'Failed to add card list');
      }
    } catch (error) {
      console.error('Error adding card list:', error);
      setError('Failed to add card list');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user || user.role !== 'manager') {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: 'rgb(240, 240, 240)'
      }}>
        <h2 style={{ color: '#dc3545' }}>Access Denied</h2>
        <p>Only managers can access this page.</p>
        <button 
          onClick={() => navigate('/home')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgb(4,120,87)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            marginTop: '16px'
          }}
        >
          Go to Home
        </button>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column', 
      padding: '32px', 
      backgroundColor: 'rgb(240, 240, 240)'
    }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>My Groups</h1>
        <button 
          onClick={() => navigate('/home')}
          style={{
            padding: '8px 16px',
            backgroundColor: 'rgb(4,120,87)',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Back to Home
        </button>
      </div>
      
      {error && (
        <div style={{ 
          backgroundColor: '#f8d7da', 
          color: '#721c24', 
          padding: '12px', 
          borderRadius: '4px', 
          marginBottom: '16px' 
        }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', marginBottom: '24px', gap: '8px' }}>
        <input
          placeholder="New group name"
          value={newGroupName}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setNewGroupName(e.target.value)}
          style={{ 
            padding: '8px', 
            border: '1px solid #ccc', 
            borderRadius: '4px', 
            flex: 1 
          }}
        />
        <button 
          onClick={createGroup} 
          style={{ 
            backgroundColor: 'rgb(4,120,87)', 
            color: 'white', 
            padding: '8px 16px', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create
        </button>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {groups.map(group => (
          <div key={group.id} style={{ 
            padding: '16px', 
            border: '1px solid #ccc', 
            borderRadius: '8px',
            backgroundColor: 'white'
          }}>
            <p style={{ fontWeight: 'bold', margin: '0 0 8px 0' }}>{group.name}</p>
            <p style={{ margin: '0 0 8px 0' }}>Members: {group.members_count || 0}</p>
            <button 
              onClick={() => openManageModal(group)}
              style={{
                padding: '4px 8px',
                backgroundColor: 'rgb(4,120,87)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Manage
            </button>
          </div>
        ))}
      </div>

      {isOpen && selectedGroup && (
        <div style={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%', 
          backgroundColor: 'rgba(0,0,0,0.5)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{ 
            backgroundColor: 'white', 
            padding: '24px', 
            borderRadius: '8px', 
            maxWidth: '600px', 
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>Manage Group: {selectedGroup.name}</h2>
              <button 
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  padding: '4px 8px'
                }}
              >
                ✕
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Members Section */}
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Members:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {groupUsers.map(u => (
                    <li key={u.id} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: '8px',
                      borderBottom: '1px solid #eee'
                    }}>
                      <span>{u.email} ({u.role_in_group})</span>
                      <button 
                        onClick={() => removeUserFromGroup(u.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
                
                <div style={{ display: 'flex', marginTop: '16px', gap: '8px' }}>
                  <input
                    placeholder="User ID"
                    value={newUserId}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewUserId(e.target.value)}
                    style={{ 
                      flex: 1,
                      padding: '8px',
                      border: '1px solid #ccc',
                      borderRadius: '4px'
                    }}
                  />
                  <button 
                    onClick={addUserToGroup}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgb(4,120,87)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    Add User
                  </button>
                </div>
              </div>

              {/* Card Lists Section */}
              <div>
                <h3 style={{ fontSize: '16px', marginBottom: '8px' }}>Card Lists:</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {groupCardLists.map(cl => (
                    <li 
                      key={cl.id} 
                      onClick={() => navigate('/cards', { state: { cardListId: cl.id, title: cl.title } })}
                      style={{ 
                        padding: '8px', 
                        borderBottom: '1px solid #eee', 
                        cursor: 'pointer',
                        color: 'rgb(4,120,87)',
                        textDecoration: 'underline'
                      }}
                    >
                      {cl.title} ({cl.cards_count} cards)
                    </li>
                  ))}
                </ul>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                  <input
                    placeholder="Card List Title"
                    value={newCardListTitle}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setNewCardListTitle(e.target.value)}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  />
                  <select 
                    value={fileType} 
                    onChange={(e) => setFileType(e.target.value as 'text' | 'txt' | 'pdf')}
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                  >
                    <option value="text">Text</option>
                    <option value="txt">TXT File</option>
                    <option value="pdf">PDF File</option>
                  </select>
                  
                  {fileType === 'text' && (
                    <textarea
                      placeholder="Text for cards"
                      value={newCardListText}
                      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setNewCardListText(e.target.value)}
                      style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', minHeight: '80px' }}
                    />
                  )}
                  
                  {(fileType === 'txt' || fileType === 'pdf') && (
                    <input
                      type="file"
                      accept={fileType === 'txt' ? '.txt' : '.pdf'}
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                      style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                    />
                  )}
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>Cards number:</span>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={cardsNum}
                      onChange={(e: ChangeEvent<HTMLInputElement>) => setCardsNum(parseInt(e.target.value) || 5)}
                      style={{ 
                        width: '80px',
                        padding: '4px',
                        border: '1px solid #ccc',
                        borderRadius: '4px'
                      }}
                    />
                    <button
                      onClick={addCardListToGroup}
                      disabled={isLoading}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: isLoading ? '#ccc' : 'rgb(4,120,87)',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: isLoading ? 'not-allowed' : 'pointer'
                      }}
                    >
                      {isLoading ? 'Generating...' : 'Add Card List'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button 
                onClick={closeModal}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Groups;