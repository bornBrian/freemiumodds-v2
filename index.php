<?php
/**
 * freemiumodds - Professional Homepage
 */

require_once __DIR__ . '/inc/db.php';
require_once __DIR__ . '/inc/functions.php';

$selected_date = isset($_GET['date']) ? $_GET['date'] : date('Y-m-d');
$selected_date = validate_date($selected_date) ? $selected_date : date('Y-m-d');
$predictions = get_predictions_by_date($selected_date);
$betting_code = get_todays_betting_code();

$is_today = $selected_date === date('Y-m-d');
$page_title = $is_today ? "Today's Tips" : format_date($selected_date);
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="description" content="85%+ accurate football predictions with real Sportybet odds. Multiple markets analyzed daily from OddsLot DC.">
    <meta name="keywords" content="football predictions, sportybet tips, betting odds, soccer predictions, BTTS, over under">
    <meta name="theme-color" content="#635BFF">
    <title>freemiumodds - 85%+ Accurate Football Predictions | Real Sportybet Odds</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
            -webkit-tap-highlight-color: transparent;
        }
        
        :root {
            --primary: #635BFF;
            --primary-dark: #4F46E5;
            --secondary: #00D924;
            --danger: #EF4444;
            --warning: #F59E0B;
            --success: #10B981;
            --dark: #0F172A;
            --dark-light: #1E293B;
            --gray-50: #F8FAFC;
            --gray-100: #F1F5F9;
            --gray-200: #E2E8F0;
            --gray-300: #CBD5E1;
            --gray-600: #475569;
            --gray-700: #334155;
            --gray-800: #1E293B;
            --gray-900: #0F172A;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            color: var(--gray-900);
            background: var(--gray-50);
            line-height: 1.6;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }
        
        /* Header - Modern Glassmorphism */
        .header {
            position: sticky;
            top: 0;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(20px) saturate(180%);
            border-bottom: 1px solid var(--gray-200);
            z-index: 1000;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .header-inner {
            max-width: 1280px;
            margin: 0 auto;
            padding: 1rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .logo {
            font-size: 1.5rem;
            font-weight: 800;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            text-decoration: none;
            letter-spacing: -0.02em;
        }
        
        .nav {
            display: flex;
            gap: 2rem;
            align-items: center;
        }
        
        .nav-link {
            color: var(--gray-700);
            text-decoration: none;
            font-size: 0.95rem;
            font-weight: 500;
            transition: all 0.2s;
            position: relative;
        }
        
        .nav-link:hover {
            color: var(--primary);
        }
        
        .nav-link::after {
            content: '';
            position: absolute;
            bottom: -4px;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--primary);
            transition: width 0.3s;
        }
        
        .nav-link:hover::after {
            width: 100%;
        }
        
        .btn-yt {
            background: linear-gradient(135deg, #FF0000 0%, #CC0000 100%);
            color: #fff;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.9rem;
            font-weight: 600;
            text-decoration: none;
            white-space: nowrap;
            box-shadow: 0 2px 8px rgba(255,0,0,0.2);
            transition: all 0.3s;
        }
        
        .btn-yt:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255,0,0,0.3);
        }
        
        /* Hero - Premium Gradient */
        .hero {
            background: linear-gradient(135deg, var(--dark) 0%, var(--dark-light) 50%, var(--primary-dark) 100%);
            color: #fff;
            padding: 3rem 1.5rem;
            text-align: center;
            position: relative;
            overflow: hidden;
        }
        
        .hero::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml,<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"><rect fill="rgba(255,255,255,0.02)" x="0" y="0" width="50" height="50"/><rect fill="rgba(255,255,255,0.02)" x="50" y="50" width="50" height="50"/></svg>');
            opacity: 0.5;
        }
        
        .hero-content {
            position: relative;
            z-index: 1;
        }
        
        .hero h1 {
            font-size: clamp(2rem, 7vw, 3rem);
            font-weight: 900;
            letter-spacing: -0.04em;
            margin-bottom: 0.75rem;
            line-height: 1.1;
        }
        
        .hero .highlight {
            background: linear-gradient(135deg, var(--secondary) 0%, #00FF40 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .hero p {
            font-size: 1.1rem;
            opacity: 0.95;
            max-width: 600px;
            margin: 0 auto 1.5rem;
            line-height: 1.7;
        }
        
        .hero-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            background: rgba(255,255,255,0.1);
            backdrop-filter: blur(10px);
            padding: 0.5rem 1rem;
            border-radius: 50px;
            font-size: 0.9rem;
            font-weight: 600;
            border: 1px solid rgba(255,255,255,0.2);
        }
        
        .hero-badge .badge-icon {
            width: 20px;
            height: 20px;
            background: var(--secondary);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 0.75rem;
        }
        
        /* Stats Bar - Premium Cards */
        .stats {
            max-width: 1280px;
            margin: -2rem auto 0;
            padding: 0 1.5rem 2rem;
            position: relative;
            z-index: 10;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
        }
        
        .stat-card {
            background: #fff;
            border-radius: 16px;
            padding: 1.5rem;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
            border: 1px solid var(--gray-200);
            transition: all 0.3s;
            text-align: center;
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 30px rgba(0,0,0,0.12);
        }
        
        .stat-icon {
            width: 48px;
            height: 48px;
            margin: 0 auto 0.75rem;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
        }
        
        .stat-value {
            font-size: 2rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            margin-bottom: 0.25rem;
        }
        
        .stat-label {
            font-size: 0.85rem;
            color: var(--gray-600);
            font-weight: 600;
        }
        
        /* Betting Code Banner - Eye-catching */
        .code-banner {
            background: linear-gradient(135deg, var(--secondary) 0%, #00B81E 100%);
            color: #fff;
            padding: 2rem 1.5rem;
            text-align: center;
            margin: 2rem 0;
            border-radius: 20px;
            max-width: 1280px;
            margin: 2rem auto;
            box-shadow: 0 10px 40px rgba(0,217,36,0.3);
            position: relative;
            overflow: hidden;
        }
        
        .code-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }
        
        @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.1); opacity: 0.3; }
        }
        
        .code-banner-content {
            position: relative;
            z-index: 1;
        }
        
        .code-title {
            font-size: 1.1rem;
            font-weight: 700;
            margin-bottom: 0.75rem;
            opacity: 0.95;
        }
        
        .code-value {
            font-size: 2.5rem;
            font-weight: 900;
            letter-spacing: 0.15em;
            margin: 1rem 0;
            text-shadow: 0 2px 10px rgba(0,0,0,0.2);
            font-family: 'Courier New', monospace;
        }
        
        .code-footer {
            font-size: 0.9rem;
            opacity: 0.9;
            margin-top: 1rem;
        }
        
        /* Predictions Container - Modern Layout */
        .container {
            max-width: 1280px;
            margin: 0 auto;
            padding: 2rem 1.5rem;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 2rem;
            flex-wrap: wrap;
            gap: 1rem;
        }
        
        .section-title {
            font-size: 1.75rem;
            font-weight: 800;
            color: var(--gray-900);
            letter-spacing: -0.02em;
        }
        
        .total-odds {
            font-size: 1.75rem;
            font-weight: 700;
            color: var(--blue);
        }
        
        .slip-table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
            border: 1px solid var(--gray-200);
            border-radius: 8px;
            overflow: hidden;
            background: #fff;
        }
        
        .slip-table thead {
            background: var(--gray-50);
        }
        
        .slip-table th {
            text-align: left;
            padding: 1rem;
            font-weight: 600;
            font-size: 0.875rem;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.05em;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .slip-table td {
            padding: 1rem;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .slip-table tbody tr:last-child td {
            border-bottom: none;
        }
        
        .slip-table tbody tr:hover {
            background: var(--gray-50);
        }
        
        .match-cell {
            font-weight: 500;
            color: var(--blue);
        }
        
        .pick-cell {
            color: var(--gray-800);
        }
        
        .odds-cell {
            font-weight: 700;
            color: var(--blue);
            text-align: right;
        }
        
        .slip-bottom {
            margin-top: 1rem;
            text-align: center;
            font-size: 0.875rem;
            color: var(--gray-600);
        }
        
        @media (max-width: 640px) {
            .slip-top {
                flex-direction: column;
                align-items: flex-start;
                gap: 0.5rem;
            }
            
            .slip-label {
                font-size: 1.25rem;
            }
            
            .total-odds {
                font-size: 1.5rem;
            }
            
            .slip-table {
                font-size: 0.875rem;
            }
            
            .slip-table th,
            .slip-table td {
                padding: 0.75rem 0.5rem;
            }
            
            .slip-table th:first-child,
            .slip-table td:first-child {
                padding-left: 1rem;
            }
            
            .slip-table th:last-child,
            .slip-table td:last-child {
                padding-right: 1rem;
            }
        }
        
        /* Date Picker - Modern Style */
        .date-picker {
            display: flex;
            gap: 0.75rem;
            align-items: center;
            background: #fff;
            padding: 0.5rem;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.05);
        }
        
        .date-input {
            padding: 0.625rem 1rem;
            border: 1px solid var(--gray-300);
            border-radius: 8px;
            font-size: 0.95rem;
            font-weight: 500;
            color: var(--gray-800);
            transition: all 0.2s;
        }
        
        .date-input:focus {
            outline: none;
            border-color: var(--primary);
            box-shadow: 0 0 0 3px rgba(99,91,255,0.1);
        }
        
        .btn-filter {
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            color: #fff;
            border: none;
            padding: 0.625rem 1.5rem;
            border-radius: 8px;
            font-weight: 600;
            font-size: 0.95rem;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 12px rgba(99,91,255,0.3);
        }
        
        .btn-filter:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 20px rgba(99,91,255,0.4);
        }
        
        .btn-filter:active {
            transform: translateY(0);
        }
        
        /* Predictions Grid - Modern Cards */
        .grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(min(100%, 360px), 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .card {
            background: #fff;
            border: 1px solid var(--gray-200);
            border-radius: 16px;
            overflow: hidden;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .card:hover {
            box-shadow: 0 12px 40px rgba(0,0,0,0.12);
            transform: translateY(-6px);
            border-color: var(--primary);
        }
        
        .card-top {
            background: linear-gradient(135deg, var(--gray-50) 0%, #fff 100%);
            padding: 1rem 1.25rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--gray-200);
        }
        
        .time {
            font-weight: 700;
            font-size: 0.95rem;
            color: var(--gray-800);
            display: flex;
            align-items: center;
            gap: 0.4rem;
        }
        
        .badge {
            padding: 0.375rem 0.875rem;
            border-radius: 20px;
            font-size: 0.75rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .badge-pending { 
            background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
            color: #92400E;
            box-shadow: 0 2px 8px rgba(251,191,36,0.3);
        }
        .badge-won { 
            background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
            color: #065F46;
            box-shadow: 0 2px 8px rgba(16,185,129,0.3);
        }
        .badge-lost { 
            background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
            color: #991B1B;
            box-shadow: 0 2px 8px rgba(239,68,68,0.3);
        }
        
        .card-body {
            padding: 1.5rem 1.25rem;
        }
        
        .teams {
            text-align: center;
            margin-bottom: 1.25rem;
        }
        
        .team {
            font-size: 1.1rem;
            font-weight: 800;
            color: var(--gray-900);
            line-height: 1.3;
        }
        
        .vs {
            color: var(--gray-600);
            margin: 0.5rem 0;
            font-size: 0.8rem;
            font-weight: 600;
            letter-spacing: 0.1em;
        }
        
        .details {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            padding-top: 1rem;
            border-top: 2px solid var(--gray-100);
        }
        
        .detail {
            text-align: center;
            padding: 0.75rem;
            background: var(--gray-50);
            border-radius: 12px;
        }
        
        .detail-label {
            font-size: 0.7rem;
            color: var(--gray-600);
            text-transform: uppercase;
            letter-spacing: 0.08em;
            font-weight: 700;
            margin-bottom: 0.5rem;
        }
        
        .detail-value {
            font-size: 1.5rem;
            font-weight: 900;
            background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
            line-height: 1;
        }
        
        .league {
            font-size: 0.85rem;
            color: var(--gray-600);
            margin-top: 1rem;
            text-align: center;
            font-weight: 500;
        }
        
        .confidence {
            background: linear-gradient(135deg, var(--warning) 0%, #F97316 100%);
            color: #fff;
            padding: 0.5rem 1rem;
            border-radius: 8px;
            font-size: 0.85rem;
            font-weight: 800;
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            margin-top: 0.75rem;
            box-shadow: 0 4px 12px rgba(245,158,11,0.3);
        }
        
        .market-type {
            display: inline-block;
            background: var(--primary);
            color: #fff;
            padding: 0.375rem 0.75rem;
            border-radius: 6px;
            font-size: 0.75rem;
            font-weight: 700;
            margin-top: 0.5rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        
        .empty {
            text-align: center;
            padding: 4rem 1.5rem;
            background: #fff;
            border-radius: 16px;
            border: 2px dashed var(--gray-300);
        }
        
        .empty p {
            color: var(--gray-600);
            font-size: 1.1rem;
            margin-bottom: 1.5rem;
        }
        
        /* Footer - Modern */
        .footer {
            background: var(--dark);
            color: #fff;
            padding: 3rem 1.5rem 2rem;
            margin-top: 4rem;
        }
        
        .footer-grid {
            max-width: 1280px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 3rem;
            margin-bottom: 2rem;
        }
        
        .footer h4 {
            font-size: 1.1rem;
            margin-bottom: 1rem;
            font-weight: 700;
        }
        
        .footer a {
            color: rgba(255,255,255,0.8);
            text-decoration: none;
            font-size: 0.95rem;
            display: block;
            margin-bottom: 0.75rem;
            transition: all 0.2s;
        }
        
        .footer a:hover {
            color: #fff;
            padding-left: 4px;
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 2rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            font-size: 0.9rem;
            opacity: 0.7;
            max-width: 1280px;
            margin: 0 auto;
        }
        
        /* Mobile Optimizations - Enhanced */
        @media (max-width: 768px) {
            .header-inner {
                padding: 1rem;
            }
            
            .logo {
                font-size: 1.25rem;
            }
            
            .nav {
                gap: 1rem;
            }
            
            .nav-link {
                font-size: 0.85rem;
            }
            
            .btn-yt {
                font-size: 0.8rem;
                padding: 0.4rem 0.8rem;
            }
            
            .hero {
                padding: 2rem 1rem;
            }
            
            .hero h1 {
                font-size: 1.75rem;
            }
            
            .hero p {
                font-size: 0.95rem;
            }
            
            .hero-badge {
                font-size: 0.85rem;
                padding: 0.4rem 0.85rem;
            }
            
            .stats {
                padding: 0 1rem 1.5rem;
            }
            
            .stats-grid {
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 0.75rem;
            }
            
            .stat-card {
                padding: 1rem;
            }
            
            .stat-icon {
                width: 40px;
                height: 40px;
                font-size: 1.25rem;
            }
            
            .stat-value {
                font-size: 1.5rem;
            }
            
            .stat-label {
                font-size: 0.75rem;
            }
            
            .code-banner {
                padding: 1.5rem 1rem;
                margin: 1.5rem 1rem;
                border-radius: 16px;
            }
            
            .code-title {
                font-size: 1rem;
            }
            
            .code-value {
                font-size: 2rem;
                letter-spacing: 0.1em;
            }
            
            .container {
                padding: 1.5rem 1rem;
            }
            
            .section-header {
                flex-direction: column;
                align-items: flex-start;
                gap: 1rem;
            }
            
            .section-title {
                font-size: 1.5rem;
            }
            
            .date-picker {
                width: 100%;
                flex-wrap: wrap;
            }
            
            .date-input {
                flex: 1;
                min-width: 150px;
            }
            
            .btn-filter {
                flex: 1;
            }
            
            .grid {
                grid-template-columns: 1fr;
                gap: 1rem;
            }
            
            .card {
                margin: 0;
            }
            
            .card-top {
                padding: 0.875rem 1rem;
            }
            
            .time {
                font-size: 0.85rem;
            }
            
            .badge {
                padding: 0.3rem 0.7rem;
                font-size: 0.7rem;
            }
            
            .card-body {
                padding: 1.25rem 1rem;
            }
            
            .team {
                font-size: 1rem;
            }
            
            .vs {
                font-size: 0.75rem;
            }
            
            .details {
                gap: 0.75rem;
            }
            
            .detail {
                padding: 0.625rem;
            }
            
            .detail-value {
                font-size: 1.25rem;
            }
            
            .league {
                font-size: 0.8rem;
            }
            
            .confidence {
                font-size: 0.8rem;
                padding: 0.4rem 0.85rem;
            }
            
            .footer {
                padding: 2rem 1rem 1.5rem;
            }
            
            .footer-grid {
                grid-template-columns: 1fr;
                gap: 2rem;
            }
            
            .footer h4 {
                font-size: 1rem;
            }
        }
        
        @media (max-width: 480px) {
            .stats-grid {
                grid-template-columns: 1fr;
            }
            
            .hero h1 {
                font-size: 1.5rem;
            }
            
            .code-value {
                font-size: 1.75rem;
            }
            
            .nav-link:not(.btn-yt) {
                display: none;
            }
        }
    </style>
</head>
<body>
    <!-- Header -->
    <header class="header">
        <div class="header-inner">
            <a href="/" class="logo">⚽ freemiumodds</a>
            <nav class="nav">
                <a href="/" class="nav-link">Home</a>
                <a href="/contact.php" class="nav-link">Contact</a>
                <a href="https://youtube.com/@footbaplays?si=nio363oxBpdtzgpi" target="_blank" class="btn-yt">📺 YouTube</a>
            </nav>
        </div>
    </header>

    <!-- Hero -->
    <section class="hero">
        <div class="hero-content">
            <h1><span class="highlight">85%+</span> Accurate Football Predictions</h1>
            <p>Real odds from Sportybet • Multiple markets analyzed • Powered by OddsLot DC data</p>
            <div class="hero-badge">
                <span class="badge-icon">✓</span>
                Updated Daily with Real Match Analysis
            </div>
        </div>
    </section>

    <!-- Stats -->
    <div class="stats">
        <div class="stats-grid">
            <div class="stat-card">
                <div class="stat-icon">🎯</div>
                <div class="stat-value"><?php echo count($predictions); ?></div>
                <div class="stat-label">Today's Tips</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">📊</div>
                <div class="stat-value">85%+</div>
                <div class="stat-label">Accuracy Rate</div>
            </div>
            <div class="stat-card">
                <div class="stat-icon">⚡</div>
                <div class="stat-value">Auto</div>
                <div class="stat-label">Updated Daily</div>
            </div>
        </div>
    </div>

    <!-- Betting Code -->
    <?php if ($betting_code && $is_today): ?>
    <div class="code-banner">
        <div class="code-banner-content">
            <div class="code-title">🎯 Today's Sportybet Booking Code</div>
            <div class="code-value"><?php echo e($betting_code); ?></div>
            <div class="code-footer">Copy this code and paste in Sportybet to place your bet</div>
        </div>
    </div>
    <?php endif; ?>

    <!-- Predictions -->
    <div class="container">
        <div class="section-header">
            <h2 class="section-title"><?php echo $page_title; ?></h2>
            <form method="GET" class="date-picker">
                <input type="date" name="date" value="<?php echo e($selected_date); ?>" class="date-input" required>
                <button type="submit" class="btn-filter">View Tips</button>
            </form>
        </div>

        <?php if (empty($predictions)): ?>
            <div class="empty">
                <p>😔 No predictions available for this date</p>
                <?php if (!$is_today): ?>
                    <a href="/" class="btn-filter" style="display:inline-block;text-decoration:none;">View Today's Tips</a>
                <?php endif; ?>
            </div>
        <?php else: ?>
            <div class="grid">
                <?php foreach ($predictions as $p): ?>
                    <div class="card">
                        <div class="card-top">
                            <span class="time">⏰ <?php echo format_time($p['match_time']); ?></span>
                            <span class="badge badge-<?php echo e($p['status']); ?>">
                                <?php 
                                    if ($p['status'] === 'won') echo '✓ Won';
                                    elseif ($p['status'] === 'lost') echo '✗ Lost';
                                    else echo 'Pending';
                                ?>
                            </span>
                        </div>
                        <div class="card-body">
                            <div class="teams">
                                <div class="team"><?php echo e($p['home_team']); ?></div>
                                <div class="vs">VS</div>
                                <div class="team"><?php echo e($p['away_team']); ?></div>
                            </div>
                            <div class="details">
                                <div class="detail">
                                    <div class="detail-label">Our Tip</div>
                                    <div class="detail-value"><?php echo e($p['tip']); ?></div>
                                </div>
                                <div class="detail">
                                    <div class="detail-label">Odds</div>
                                    <div class="detail-value"><?php echo is_numeric($p['odds']) ? number_format($p['odds'], 2) : e($p['odds']); ?></div>
                                </div>
                            </div>
                            <?php if (!empty($p['league'])): ?>
                                <div class="league">📍 <?php echo e($p['league']); ?></div>
                            <?php endif; ?>
                            <?php if (!empty($p['confidence']) && $p['confidence'] >= 85): ?>
                                <div style="text-align:center;">
                                    <span class="confidence">🔥 <?php echo number_format($p['confidence'], 0); ?>% Confidence</span>
                                </div>
                            <?php endif; ?>
                        </div>
                    </div>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-grid">
            <div>
                <h4>freemiumodds</h4>
                <p style="opacity:0.8;font-size:0.85rem;">High-confidence football predictions updated daily.</p>
            </div>
            <div>
                <h4>Contact</h4>
                <a href="mailto:bonbrian2@gmail.com">bonbrian2@gmail.com</a>
                <a href="tel:+255653931988">+255 653 931 988</a>
            </div>
            <div>
                <h4>Follow Us</h4>
                <a href="https://youtube.com/@footbaplays?si=nio363oxBpdtzgpi" target="_blank">YouTube Channel</a>
            </div>
        </div>
        <div class="footer-bottom">
            © <?php echo date('Y'); ?> freemiumodds. All rights reserved.
        </div>
    </footer>

    <script type='text/javascript' src='//truthfulverb.com/37/cc/c5/37ccc5eef40a0021666278c1448d1ee1.js'></script>
</body>
</html>
