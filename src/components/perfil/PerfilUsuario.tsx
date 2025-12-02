import React, { useState, useEffect, useRef } from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import {
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Avatar,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tabs,
  Tab,
  Box,
  Chip,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Badge,
  Divider,
  useMediaQuery,
  CircularProgress,
  Fab,
  Menu,
  MenuItem,
  
  Tooltip,
  Switch,
  FormControlLabel,
  LinearProgress,
  Snackbar,
  CardActions,
} from '@material-ui/core';
import CloudUpload from '@material-ui/icons/CloudUpload';

import { Alert } from '@material-ui/lab';
import CheckCircle from '@material-ui/icons/CheckCircle';

import {
  PhotoCamera,
  Edit,
  Settings,
  Public,
  Lock,
  People,
  Favorite,
  Comment,
  Share,
  MoreVert,
  Add,
  LocationOn,
  Work,
  School,
  Cake,
  Phone,
  Email,
  Link as LinkIcon,
  Star,
  Extension,

  Close,
  Save,
  Cancel,
 
  VideoCall,
  Message,
  PersonAdd,
  PersonAddDisabled,
  Block,
  Report,
  Delete,
  FavoriteBorder,
 
} from '@material-ui/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  addDoc,
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from '@/logic/firebase/config/app';

const useStyles = makeStyles((theme) => ({
  root: {
    background: theme.palette.type === 'dark' 
      ? 'linear-gradient(135deg, #0c0c0c 0%, #1a1a1a 50%, #2d2d2d 100%)'
      : 'linear-gradient(135deg, #f0f2f5 0%, #ffffff 100%)',
    minHeight: '100vh',
    padding: 0,
  },
  container: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: theme.spacing(0, 2),
  },
  profileHeader: {
    background: 'linear-gradient(135deg, #1877f2 0%, #42a5f5 100%)',
    borderRadius: '0 0 20px 20px',
    padding: theme.spacing(3, 2),
    color: 'white',
    position: 'relative',
    overflow: 'hidden',
    [theme.breakpoints.down('md')]: {
      padding: theme.spacing(2, 1),
    },
  },
  coverPhoto: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    objectFit: 'cover',
    opacity: 0.3,
  },
  profileContent: {
    position: 'relative',
    zIndex: 2,
  },
  profileAvatar: {
    width: 160,
    height: 160,
    border: '6px solid white',
    margin: '0 auto',
    [theme.breakpoints.down('md')]: {
      width: 120,
      height: 120,
    },
  },
  profileInfo: {
    textAlign: 'center',
    marginTop: theme.spacing(2),
  },
  profileName: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: theme.spacing(1),
    [theme.breakpoints.down('md')]: {
      fontSize: '2rem',
    },
  },
  profileBio: {
    fontSize: '1.1rem',
    opacity: 0.9,
    marginBottom: theme.spacing(2),
  },
  profileStats: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(4),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      gap: theme.spacing(2),
      flexWrap: 'wrap',
    },
  },
  statItem: {
    textAlign: 'center',
  },
  statNumber: {
    fontSize: '1.8rem',
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: '0.9rem',
    opacity: 0.8,
  },
  actionButtons: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      flexWrap: 'wrap',
    },
  },
  tabsContainer: {
    background: theme.palette.background.paper,
    marginTop: theme.spacing(3),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[2],
  },
  tabContent: {
    padding: theme.spacing(3),
    minHeight: '60vh',
  },
  postCard: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(2),
    overflow: 'hidden',
    transition: 'all 0.3s ease',
    '&:hover': {
      boxShadow: theme.shadows[8],
    },
  },
  postMedia: {
    maxHeight: 400,
    objectFit: 'cover',
    width: '100%',
  },
  infoCard: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  photoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: theme.spacing(1),
  },
  photoItem: {
    position: 'relative',
    aspectRatio: '1',
    borderRadius: theme.spacing(1),
    overflow: 'hidden',
    cursor: 'pointer',
    '&:hover': {
      '& $photoOverlay': {
        opacity: 1,
      },
    },
  },
  photoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  editButton: {
    position: 'absolute',
    top: theme.spacing(2),
    right: theme.spacing(2),
    zIndex: 3,
    background: 'rgba(255,255,255,0.9)',
    '&:hover': {
      background: 'white',
    },
  },
  friendCard: {
    textAlign: 'center',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    border: '1px solid',
    borderColor: theme.palette.divider,
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    '&:hover': {
      boxShadow: theme.shadows[4],
      transform: 'translateY(-2px)',
    },
  },
  aiInsight: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    padding: theme.spacing(2),
    borderRadius: theme.spacing(2),
    margin: theme.spacing(2, 0),
  },
  uploadArea: {
    border: '2px dashed',
    borderColor: theme.palette.primary.main,
    borderRadius: theme.spacing(2),
    padding: theme.spacing(4),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  privacySettings: {
    background: theme.palette.background.paper,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing(4),
  },
  createPostCard: {
    marginBottom: theme.spacing(3),
    borderRadius: theme.spacing(2),
    padding: theme.spacing(2),
  },
  createPostInput: {
    width: '100%',
    '& .MuiOutlinedInput-root': {
      borderRadius: theme.spacing(2),
    },
  },
}));

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box>{children}</Box>}
    </div>
  );
}

interface PerfilUsuarioProps {
  userId: string;
  isOwnProfile?: boolean;
  onClose?: () => void;
}

interface UserProfile {
  id: string;
  nome: string;
  email: string;
  imagemUrl: string;
  bio?: string;
  coverPhoto?: string;
  location?: string;
  work?: string;
  education?: string;
  birthday?: string;
  phone?: string;
  website?: string;
  isPrivate?: boolean;
  verified?: boolean;
  joinDate?: Timestamp;
  followers?: string[];
  following?: string[];
  posts?: number;
  photos?: number;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrls?: string[];
  timestamp: Timestamp;
  likes: number;
  comments: number;
  shares: number;
  likedBy?: string[];
}

interface UserPhoto {
  id: string;
  url: string;
  timestamp: Timestamp;
  caption?: string;
}

const PerfilUsuario: React.FC<PerfilUsuarioProps> = ({ userId, isOwnProfile = false, onClose }) => {
  const classes = useStyles();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [isClient, setIsClient] = useState(false);

  // Estados principais
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [photos, setPhotos] = useState<UserPhoto[]>([]);
  const [friends, setFriends] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);

  // Estados para edição
  const [editMode, setEditMode] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<UserProfile>>({});
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  // Estados para UI
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);
  const [photoDialog, setPhotoDialog] = useState<string | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });

  // Estados para IA
  const [aiAnalysis, setAiAnalysis] = useState<string[]>([]);
  const [analyzingProfile, setAnalyzingProfile] = useState(false);

  // Estados para posts
  const [newPostContent, setNewPostContent] = useState('');
  const [createPostDialog, setCreatePostDialog] = useState(false);
  const [uploadingPost, setUploadingPost] = useState(false);

  // Estados para relacionamentos
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Refs
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const postMediaInputRef = useRef<HTMLInputElement>(null);

  // Carregar dados do perfil
  useEffect(() => {
    setIsClient(true);
    loadProfile();
    loadUserPosts();
    loadUserPhotos();
    loadUserFriends();
    if (!isOwnProfile) {
      checkFollowStatus();
    }
  }, [userId]);

  const loadProfile = async () => {
    try {
      const userDoc = await getDoc(doc(db, 'usuarios', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as UserProfile;
        setProfile({ ...userData, id: userDoc.id });

        setEditedProfile(userData);
        setFollowersCount(userData.followers?.length || 0);
        setFollowingCount(userData.following?.length || 0);
      }
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao carregar perfil do usuário',
        severity: 'error',
      });
    }
    setLoading(false);
  };

  const loadUserPosts = async () => {
    try {
      const postsQuery = query(
        collection(db, 'feed_posts'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(20)
      );

      const postsSnapshot = await getDocs(postsQuery);
      const userPosts: Post[] = [];

      postsSnapshot.forEach((doc) => {
        userPosts.push({ id: doc.id, ...doc.data() } as Post);
      });

      setPosts(userPosts);
    } catch (error) {
      console.error('Erro ao carregar posts:', error);
    }
  };

  const loadUserPhotos = async () => {
    try {
      const photosQuery = query(
        collection(db, 'user_photos'),
        where('userId', '==', userId),
        orderBy('timestamp', 'desc'),
        limit(50)
      );

      const photosSnapshot = await getDocs(photosQuery);
      const userPhotos: UserPhoto[] = [];

      photosSnapshot.forEach((doc) => {
        userPhotos.push({ id: doc.id, ...doc.data() } as UserPhoto);
      });

      setPhotos(userPhotos);
    } catch (error) {
      console.error('Erro ao carregar fotos:', error);
    }
  };

  const loadUserFriends = async () => {
    try {
      if (profile?.following) {
        const friendsPromises = profile.following.map(async (friendId) => {
          const friendDoc = await getDoc(doc(db, 'usuarios', friendId));
          if (friendDoc.exists()) {
            return { id: friendDoc.id, ...friendDoc.data() } as UserProfile;
          }
          return null;
        });

        const friendsResults = await Promise.all(friendsPromises);
        setFriends(friendsResults.filter(friend => friend !== null) as UserProfile[]);
      }
    } catch (error) {
      console.error('Erro ao carregar amigos:', error);
    }
  };

  const checkFollowStatus = async () => {
    try {
      const currentUserDoc = await getDoc(doc(db, 'usuarios', 'currentUserId')); // Substituir por ID real
      if (currentUserDoc.exists()) {
        const currentUserData = currentUserDoc.data();
        setIsFollowing(currentUserData.following?.includes(userId) || false);
      }
    } catch (error) {
      console.error('Erro ao verificar status de seguidor:', error);
    }
  };

  const handleFollow = async () => {
    if (!profile) return;

    try {
      const currentUserId = 'currentUserId'; // Substituir por ID real do usuário logado

      if (isFollowing) {
        // Unfollow
        await updateDoc(doc(db, 'usuarios', currentUserId), {
          following: profile.following?.filter(id => id !== userId) || []
        });
        await updateDoc(doc(db, 'usuarios', userId), {
          followers: profile.followers?.filter(id => id !== currentUserId) || []
        });
        setIsFollowing(false);
        setFollowersCount(prev => prev - 1);
      } else {
        // Follow
        await updateDoc(doc(db, 'usuarios', currentUserId), {
          following: [...(profile.following || []), userId]
        });
        await updateDoc(doc(db, 'usuarios', userId), {
          followers: [...(profile.followers || []), currentUserId]
        });
        setIsFollowing(true);
        setFollowersCount(prev => prev + 1);
      }

      setSnackbar({
        open: true,
        message: isFollowing ? 'Deixou de seguir' : 'Seguindo!',
        severity: 'success',
      });

    } catch (error) {
      console.error('Erro ao seguir/desseguir:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar status de seguidor',
        severity: 'error',
      });
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !profile) return;

    setUploadingPost(true);

    try {
      await addDoc(collection(db, 'feed_posts'), {
        userId: profile.id,
        content: newPostContent,
        timestamp: Timestamp.now(),
        likes: 0,
        comments: 0,
        shares: 0,
        likedBy: [],
      });

      setNewPostContent('');
      setCreatePostDialog(false);
      loadUserPosts(); // Recarregar posts

      setSnackbar({
        open: true,
        message: 'Post criado com sucesso!',
        severity: 'success',
      });

    } catch (error) {
      console.error('Erro ao criar post:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao criar post',
        severity: 'error',
      });
    }

    setUploadingPost(false);
  };

  const handleLikePost = async (postId: string) => {
    const currentUserId = 'currentUserId'; // Substituir por ID real
    const post = posts.find(p => p.id === postId);
    if (!post) return;

    try {
      const isLiked = post.likedBy?.includes(currentUserId) || false;
      const newLikedBy = isLiked 
        ? post.likedBy?.filter(id => id !== currentUserId) || []
        : [...(post.likedBy || []), currentUserId];

      await updateDoc(doc(db, 'feed_posts', postId), {
        likes: newLikedBy.length,
        likedBy: newLikedBy,
      });

      // Atualizar estado local
      setPosts(prevPosts => 
        prevPosts.map(p => 
          p.id === postId 
            ? { ...p, likes: newLikedBy.length, likedBy: newLikedBy }
            : p
        )
      );

    } catch (error) {
      console.error('Erro ao curtir post:', error);
    }
  };

  const handlePhotoUpload = async (file: File, type: 'avatar' | 'cover' | 'photo') => {
    if (!profile) return;

    const setUploading = type === 'avatar' ? setUploadingPhoto : 
                        type === 'cover' ? setUploadingCover : 
                        setUploadingPhoto;

    setUploading(true);

    try {
      const storageRef = ref(storage, `users/${userId}/${type}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      if (type === 'avatar') {
        await updateDoc(doc(db, 'usuarios', userId), {
          imagemUrl: downloadURL,
        });
        setProfile(prev => prev ? { ...prev, imagemUrl: downloadURL } : null);
      } else if (type === 'cover') {
        await updateDoc(doc(db, 'usuarios', userId), {
          coverPhoto: downloadURL,
        });
        setProfile(prev => prev ? { ...prev, coverPhoto: downloadURL } : null);
      } else if (type === 'photo') {
        await addDoc(collection(db, 'user_photos'), {
          userId,
          url: downloadURL,
          timestamp: Timestamp.now(),
        });
        loadUserPhotos(); // Recarregar fotos
      }

      setSnackbar({
        open: true,
        message: 'Foto enviada com sucesso!',
        severity: 'success',
      });

    } catch (error) {
      console.error('Erro ao enviar foto:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao enviar foto. Tente novamente.',
        severity: 'error',
      });
    }

    setUploading(false);
  };

  const handleSaveProfile = async () => {
    if (!profile) return;

    try {
      await updateDoc(doc(db, 'usuarios', userId), editedProfile);
      setProfile(prev => prev ? { ...prev, ...editedProfile } : null);
      setEditMode(false);

      setSnackbar({
        open: true,
        message: 'Perfil atualizado com sucesso!',
        severity: 'success',
      });

    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao salvar perfil. Tente novamente.',
        severity: 'error',
      });
    }
  };

  const analyzeProfileWithAI = async () => {
    if (!profile) return;

    setAnalyzingProfile(true);

    try {
      const response = await fetch('/api/ia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: `Analise este perfil de usuário e forneça insights sobre engajamento, sugestões de melhoria e tendências: Nome: ${profile.nome}, Bio: ${profile.bio || 'Não informado'}, Posts: ${posts.length}, Fotos: ${photos.length}`,
          maxTokens: 200,
        }),
      });

      const data = await response.json();
      if (data.response) {
        const insights = data.response.split('\n').filter((line: string) => line.trim());
        setAiAnalysis(insights);
      }
    } catch (error) {
      console.error('Erro na análise de IA:', error);
    }

    setAnalyzingProfile(false);
  };

  const formatDate = (timestamp: Timestamp) => {
    return timestamp.toDate().toLocaleDateString('pt-BR');
  };

  if (!isClient || loading) {
    return (
      <div className={classes.loadingContainer}>
        <CircularProgress size={50} />
        <Typography variant="h6" style={{ marginLeft: 16 }}>
          Carregando perfil...
        </Typography>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className={classes.loadingContainer}>
        <Typography variant="h6">
          Usuário não encontrado
        </Typography>
      </div>
    );
  }

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        {/* Header do Perfil */}
        <Paper className={classes.profileHeader}>
          {profile.coverPhoto && (
            <img 
              src={profile.coverPhoto} 
              alt="Foto de capa"
              className={classes.coverPhoto}
            />
          )}

          <div className={classes.profileContent}>
            {isOwnProfile && (
              <IconButton 
                className={classes.editButton}
                onClick={() => setEditMode(!editMode)}
              >
                <Edit />
              </IconButton>
            )}

            {/* Avatar */}
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <Avatar 
                src={profile.imagemUrl} 
                className={classes.profileAvatar}
              />
              {profile.verified && (
                <CheckCircle
                  style={{ 
                    position: 'absolute', 
                    bottom: 10, 
                    right: 10, 
                    color: '#1877f2',
                    background: 'white',
                    borderRadius: '50%',
                    padding: 2
                  }} 
                />
              )}
              {isOwnProfile && editMode && (
                <Fab
                  size="small"
                  style={{ 
                    position: 'absolute', 
                    bottom: 0, 
                    right: 0,
                    background: 'white'
                  }}
                  onClick={() => avatarInputRef.current?.click()}
                >
                  <PhotoCamera />
                </Fab>
              )}
            </div>

            {/* Informações do Perfil */}
            <div className={classes.profileInfo}>
              {editMode ? (
                <TextField
                  value={editedProfile.nome || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, nome: e.target.value }))}
                  variant="outlined"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)', 
                    borderRadius: 8,
                    marginBottom: 16
                  }}
                />
              ) : (
                <Typography className={classes.profileName}>
                  {profile.nome}
                  {profile.verified && (
                    <CheckCircle style={{ marginLeft: 8, color: '#1877f2' }} />
                  )}
                </Typography>
              )}

              {editMode ? (
                <TextField
                  value={editedProfile.bio || ''}
                  onChange={(e) => setEditedProfile(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Escreva uma bio..."
                  multiline
                  rows={2}
                  variant="outlined"
                  style={{ 
                    background: 'rgba(255,255,255,0.9)', 
                    borderRadius: 8,
                    width: '100%',
                    maxWidth: 400
                  }}
                />
              ) : profile.bio && (
                <Typography className={classes.profileBio}>
                  {profile.bio}
                </Typography>
              )}

              {/* Estatísticas */}
              <div className={classes.profileStats}>
                <div className={classes.statItem}>
                  <Typography className={classes.statNumber}>
                    {posts.length}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Posts
                  </Typography>
                </div>

                <div className={classes.statItem}>
                  <Typography className={classes.statNumber}>
                    {followersCount}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Seguidores
                  </Typography>
                </div>

                <div className={classes.statItem}>
                  <Typography className={classes.statNumber}>
                    {followingCount}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Seguindo
                  </Typography>
                </div>

                <div className={classes.statItem}>
                  <Typography className={classes.statNumber}>
                    {photos.length}
                  </Typography>
                  <Typography className={classes.statLabel}>
                    Fotos
                  </Typography>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className={classes.actionButtons}>
                {editMode ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<Save />}
                      onClick={handleSaveProfile}
                    >
                      Salvar
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<Cancel />}
                      onClick={() => {
                        setEditMode(false);
                        setEditedProfile(profile);
                      }}
                    >
                      Cancelar
                    </Button>
                  </>
                ) : isOwnProfile ? (
                  <>
                    <Button 
                      variant="contained" 
                      color="primary"
                      startIcon={<Edit />}
                      onClick={() => setEditMode(true)}
                    >
                      Editar Perfil
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<Add />}
                      onClick={() => setCreatePostDialog(true)}
                    >
                      Criar Post
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<Extension />}
                      onClick={analyzeProfileWithAI}
                      disabled={analyzingProfile}
                    >
                      {analyzingProfile ? 'Analisando...' : 'Análise IA'}
                    </Button>
                  </>
                ) : (
                  <>
                    <Button 
                      variant="contained" 
                      color={isFollowing ? "default" : "primary"}
                      startIcon={isFollowing ? <PersonAddDisabled /> : <PersonAdd />}
                      onClick={handleFollow}
                    >
                      {isFollowing ? 'Seguindo' : 'Seguir'}
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<Message />}
                    >
                      Mensagem
                    </Button>
                    <Button 
                      variant="outlined"
                      startIcon={<VideoCall />}
                    >
                      Chamada
                    </Button>
                  </>
                )}

                <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                  <MoreVert />
                </IconButton>
              </div>
            </div>
          </div>
        </Paper>

        {/* Insights da IA */}
        {aiAnalysis.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={classes.aiInsight}
          >
            <Typography variant="h6" gutterBottom>
              <Extension style={{ marginRight: 8, verticalAlign: 'middle' }} />
              Insights da IA sobre o Perfil
            </Typography>
            {aiAnalysis.map((insight, idx) => (
              <Typography key={idx} variant="body2" paragraph>
                • {insight}
              </Typography>
            ))}
          </motion.div>
        )}

        {/* Tabs de Conteúdo */}
        <Paper className={classes.tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            indicatorColor="primary"
            textColor="primary"
            variant={isMobile ? "scrollable" : "standard"}
            scrollButtons="auto"
          >
            <Tab label="Timeline" />
            <Tab label="Sobre" />
            <Tab label="Fotos" />
            <Tab label="Amigos" />
            {isOwnProfile && <Tab label="Configurações" />}
          </Tabs>

          {/* Timeline */}
          <TabPanel value={tabValue} index={0}>
            <div className={classes.tabContent}>
              {/* Criar Post (apenas perfil próprio) */}
              {isOwnProfile && (
                <Card className={classes.createPostCard}>
                  <CardContent>
                    <TextField
                      placeholder={`O que está pensando, ${profile.nome}?`}
                      multiline
                      minRows={3}
                      variant="outlined"
                      className={classes.createPostInput}
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                    />
                  </CardContent>
                  <CardActions>
                    <Button 
                      variant="contained" 
                      color="primary"
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim() || uploadingPost}
                      startIcon={uploadingPost ? <CircularProgress size={20} /> : <Add />}
                    >
                      {uploadingPost ? 'Publicando...' : 'Publicar'}
                    </Button>
                  </CardActions>
                </Card>
              )}

              {posts.length === 0 ? (
                <Typography variant="h6" color="textSecondary" style={{ textAlign: 'center', padding: 40 }}>
                  Nenhum post encontrado
                </Typography>
              ) : (
                posts.map((post) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <Card className={classes.postCard}>
                      <CardContent>
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                          <Avatar src={profile.imagemUrl} />
                          <div style={{ marginLeft: 12 }}>
                            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                              {profile.nome}
                            </Typography>
                            <Typography variant="caption" color="textSecondary">
                              {formatDate(post.timestamp)}
                            </Typography>
                          </div>
                        </div>

                        <Typography variant="body1" style={{ marginBottom: 16 }}>
                          {post.content}
                        </Typography>

                        {post.mediaUrls && post.mediaUrls.length > 0 && (
                          <img 
                            src={post.mediaUrls[0]} 
                            alt="Post media"
                            className={classes.postMedia}
                          />
                        )}
                      </CardContent>

                      <CardActions style={{ justifyContent: 'space-between', padding: '8px 16px' }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <Button 
                            startIcon={post.likedBy?.includes('currentUserId') ? <Favorite /> : <FavoriteBorder />}
                            size="small"
                            onClick={() => handleLikePost(post.id)}
                            style={{ 
                              color: post.likedBy?.includes('currentUserId') ? '#e91e63' : 'inherit' 
                            }}
                          >
                            {post.likes}
                          </Button>
                          <Button startIcon={<Comment />} size="small">
                            {post.comments}
                          </Button>
                          <Button startIcon={<Share />} size="small">
                            {post.shares}
                          </Button>
                        </div>
                      </CardActions>
                    </Card>
                  </motion.div>
                ))
              )}
            </div>
          </TabPanel>

          {/* Sobre */}
          <TabPanel value={tabValue} index={1}>
            <div className={classes.tabContent}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Card className={classes.infoCard}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Informações Básicas
                      </Typography>

                      {profile.location && (
                        <div className={classes.infoItem}>
                          <LocationOn color="primary" />
                          <Typography>{profile.location}</Typography>
                        </div>
                      )}

                      {profile.work && (
                        <div className={classes.infoItem}>
                          <Work color="primary" />
                          <Typography>{profile.work}</Typography>
                        </div>
                      )}

                      {profile.education && (
                        <div className={classes.infoItem}>
                          <School color="primary" />
                          <Typography>{profile.education}</Typography>
                        </div>
                      )}

                      {profile.birthday && (
                        <div className={classes.infoItem}>
                          <Cake color="primary" />
                          <Typography>{profile.birthday}</Typography>
                        </div>
                      )}

                      {profile.joinDate && (
                        <div className={classes.infoItem}>
                          <Star color="primary" />
                          <Typography>
                            Membro desde {formatDate(profile.joinDate)}
                          </Typography>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Card className={classes.infoCard}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Contato
                      </Typography>

                      <div className={classes.infoItem}>
                        <Email color="primary" />
                        <Typography>{profile.email}</Typography>
                      </div>

                      {profile.phone && (
                        <div className={classes.infoItem}>
                          <Phone color="primary" />
                          <Typography>{profile.phone}</Typography>
                        </div>
                      )}

                      {profile.website && (
                        <div className={classes.infoItem}>
                          <LinkIcon color="primary" />
                          <Typography>{profile.website}</Typography>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </div>
          </TabPanel>

          {/* Fotos */}
          <TabPanel value={tabValue} index={2}>
            <div className={classes.tabContent}>
              {isOwnProfile && (
                <div 
                  className={classes.uploadArea}
                  onClick={() => photoInputRef.current?.click()}
                >
                  <CloudUpload style={{ fontSize: 48, marginBottom: 16, color: theme.palette.primary.main }} />
                  <Typography variant="h6">
                    Adicionar Fotos
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Clique para enviar suas fotos
                  </Typography>
                </div>
              )}

              <div className={classes.photoGrid}>
                {photos.map((photo, index) => (
                  <div 
                    key={photo.id}
                    className={classes.photoItem}
                    onClick={() => setPhotoDialog(photo.url)}
                  >
                    <img 
                      src={photo.url} 
                      alt={`Foto ${index + 1}`}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <div className={classes.photoOverlay}>
                      <Typography variant="body2" style={{ color: 'white' }}>
                        Ver foto
                      </Typography>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabPanel>

          {/* Amigos */}
          <TabPanel value={tabValue} index={3}>
            <div className={classes.tabContent}>
              <Grid container spacing={2}>
                {friends.map((friend) => (
                  <Grid item xs={6} sm={4} md={3} key={friend.id}>
                    <div className={classes.friendCard}>
                      <Avatar 
                        src={friend.imagemUrl} 
                        style={{ width: 80, height: 80, margin: '0 auto 8px' }}
                      />
                      <Typography variant="subtitle2" style={{ fontWeight: 'bold' }}>
                        {friend.nome}
                      </Typography>
                      <Button size="small" variant="outlined" style={{ marginTop: 8 }}>
                        Ver Perfil
                      </Button>
                    </div>
                  </Grid>
                ))}
              </Grid>
            </div>
          </TabPanel>

          {/* Configurações (apenas para próprio perfil) */}
          {isOwnProfile && (
            <TabPanel value={tabValue} index={4}>
              <div className={classes.tabContent}>
                <Typography variant="h6" gutterBottom>
                  Configurações de Privacidade
                </Typography>

                <div className={classes.privacySettings}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={!profile.isPrivate}
                        onChange={(e) => setEditedProfile(prev => ({ ...prev, isPrivate: !e.target.checked }))}
                      />
                    }
                    label="Perfil público"
                  />
                  <Typography variant="caption" color="textSecondary">
                    Permitir que qualquer pessoa veja seu perfil
                  </Typography>
                </div>

                <Button 
                  variant="contained" 
                  color="primary"
                  onClick={handleSaveProfile}
                  style={{ marginTop: 16 }}
                >
                  Salvar Configurações
                </Button>
              </div>
            </TabPanel>
          )}
        </Paper>
      </div>

      {/* Inputs ocultos para upload */}
      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={avatarInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhotoUpload(file, 'avatar');
        }}
      />

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={coverInputRef}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handlePhotoUpload(file, 'cover');
        }}
      />

      <input
        type="file"
        accept="image/*"
        multiple
        style={{ display: 'none' }}
        ref={photoInputRef}
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          files.forEach(file => handlePhotoUpload(file, 'photo'));
        }}
      />

      {/* Dialog para criar post */}
      <Dialog
        open={createPostDialog}
        onClose={() => setCreatePostDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Criar Novo Post
        </DialogTitle>
        <DialogContent>
          <TextField
            placeholder={`O que está pensando, ${profile.nome}?`}
            multiline
            minRows={4}
            variant="outlined"
            fullWidth
            value={newPostContent}
            onChange={(e) => setNewPostContent(e.target.value)}
            style={{ marginTop: 16 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreatePostDialog(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleCreatePost}
            variant="contained"
            color="primary"
            disabled={!newPostContent.trim() || uploadingPost}
          >
            {uploadingPost ? 'Publicando...' : 'Publicar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu de Opções */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={() => setMenuAnchor(null)}
      >
        {isOwnProfile ? (
          [
            <MenuItem key="settings" onClick={() => setTabValue(4)}>
              <Settings style={{ marginRight: 8 }} />
              Configurações
            </MenuItem>,
            <MenuItem key="cover" onClick={() => coverInputRef.current?.click()}>
              <PhotoCamera style={{ marginRight: 8 }} />
              Alterar Capa
            </MenuItem>
          ]
        ) : (
          [
            <MenuItem key="block">
              <Block style={{ marginRight: 8 }} />
              Bloquear
            </MenuItem>,
            <MenuItem key="report">
              <Report style={{ marginRight: 8 }} />
              Reportar
            </MenuItem>
          ]
        )}
      </Menu>

      {/* Dialog de Foto */}
      <Dialog
        open={Boolean(photoDialog)}
        onClose={() => setPhotoDialog(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogContent style={{ padding: 0 }}>
          {photoDialog && (
            <img 
              src={photoDialog} 
              alt="Foto ampliada"
              style={{ width: '100%', height: 'auto' }}
            />
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(null)}>
            Fechar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default PerfilUsuario;